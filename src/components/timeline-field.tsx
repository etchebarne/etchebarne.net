import { DitherShader } from "@/lib/dither";
import type { DitherShaderProps } from "@/lib/dither";

/** Up to this many roles are drawn; uniforms can't be arrays in WebGL 1. */
export const MAX_SEGMENTS = 8;

// Each role is a beam of light along its lane: thicker and brighter with
// seniority, dust drifting along it with time, and a glowing head on the
// roles still running. Year gridlines and today are drawn in the same dither.
// Segments arrive as vec4(start, end, lane, level), x in 0..1 of the box.
const SEGMENT = Array.from({ length: MAX_SEGMENTS }, (_, i) => `
  {
    vec4 seg = tlSeg${i};
    if (seg.y > seg.x) {
      float focus = tlFocus < 0.0 ? 1.0 : (abs(tlFocus - ${i}.0) < 0.5 ? 1.15 : 0.45);
      tone = max(tone, timelineBeam(cell, res, t, seg, ${i}.0) * focus);
    }
  }`).join("");

const FIELD = `
float timelineBeam(vec2 cell, vec2 res, float t, vec4 seg, float index) {
  float laneH = res.y / tlLanes;
  float y = res.y - (seg.z + 0.74) * laneH;
  float x0 = seg.x * res.x;
  float x1 = seg.y * res.x;
  float dx = max(max(x0 - cell.x, cell.x - x1), 0.0);
  float dy = abs(cell.y - y);
  float d = length(vec2(dx, dy));
  float level = seg.w;

  float halfWidth = 0.9 + 1.6 * level;
  float core = 1.0 - smoothstep(halfWidth, halfWidth + 0.8, d);
  float dust = fbm(vec2(cell.x * 0.06 - t * (0.6 + index * 0.07), cell.y * 0.35 + index * 7.0));
  float glow = exp(-d / (1.6 + 3.2 * level)) * (0.25 + 0.4 * level) * smoothstep(0.25, 0.75, dust) * 1.5;

  // Still running: a head at "now" that breathes.
  float running = step(tlNow - 0.0005, seg.y);
  float head = running * exp(-length(cell - vec2(x1, y)) / (2.0 + 0.6 * sin(t * 1.6))) * 0.9;

  return clamp(max(core * (0.55 + 0.45 * level), max(glow, head)), 0.0, 1.0);
}

float field(vec2 uv, vec2 res, float t) {
  vec2 cell = uv * res;
  float tone = 0.0;

  // Year gridlines: dotted, one cell wide. Today: a solid grey line.
  float yearCells = tlYears.y * res.x;
  float fromYear = abs(fract((cell.x - tlYears.x * res.x) / yearCells + 0.5) - 0.5) * yearCells;
  float onYear = 1.0 - step(0.55, fromYear);
  float dotted = step(mod(cell.y, 3.0), 1.0);
  tone = max(tone, onYear * dotted * 0.5);
  float onNow = 1.0 - step(0.55, abs(cell.x - tlNow * res.x));
  tone = max(tone, onNow * 0.5);
${SEGMENT}
  return tone;
}
`;

export type TimelineUniforms = Record<`tlSeg${number}`, [number, number, number, number]> & {
  tlLanes: number;
  tlNow: number;
  /** First year line x (0..1) and the width of one year. */
  tlYears: [number, number];
  /** Index of the highlighted role, or -1. */
  tlFocus: number;
};

// Paper, a dim grey, then ink, as in the hero.
const PALETTE = ["--background", "oklch(0.34 0 0)", "--foreground"] as const;

type TimelineFieldProps = Omit<DitherShaderProps, "field" | "colorField" | "uniforms"> & {
  uniforms: TimelineUniforms;
};

export const TimelineField = ({ uniforms, ...props }: TimelineFieldProps) => (
  <DitherShader matrix="bayer4" levels={17} palette={PALETTE} stillTime={5} cell={3} {...props} field={FIELD} uniforms={uniforms} />
);
