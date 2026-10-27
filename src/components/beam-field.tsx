import { DitherShader } from "@/lib/dither";
import type { DitherShaderProps } from "@/lib/dither";

// The etchebarne.net mark, rebuilt as geometry so it can be lit, zoomed and
// dissolved in the shader. Everything in `mark*` is in the logo's own SVG
// units (544 x 453, y down), taken from public/logo/etchebarne-icon.svg.
const MARK = `
const vec2 markCentre = vec2(272.0, 226.5);
const vec2 markRingC = vec2(277.75, 226.5);
const float markRo = 226.5;
const float markRi = 143.2;
// The crossbar is a parallelogram: P0 + a * D + b * V, with a and b in 0..1.
const vec2 markP0 = vec2(42.28, 266.28);
const vec2 markD = vec2(501.25, -155.664);
const vec2 markV = vec2(-42.28, 83.352);
const vec2 markAcross = vec2(0.29657, 0.95501);
const vec2 markAlong = vec2(0.95501, -0.29657);
const float markBarWidth = 67.06;

// x: inside (0 or 1), y: position across the profile (0..1), z: 1 on the bar.
vec3 markShape(vec2 L) {
  vec2 w = L - markP0;
  float det = markD.x * markV.y - markD.y * markV.x;
  float a = (w.x * markV.y - w.y * markV.x) / det;
  float b = (markD.x * w.y - markD.y * w.x) / det;
  if (a >= 0.0 && a <= 1.0 && b >= 0.0 && b <= 1.0) return vec3(1.0, b, 1.0);
  vec2 q = L - markRingC;
  float r = length(q);
  if (r < markRi || r > markRo) return vec3(0.0);
  // The opening on the right, between -37 and 13.6 degrees (y up). Cross
  // products instead of atan, which some drivers return NaN for at y = 0.
  vec2 up = vec2(q.x, -q.y);
  float afterLow = 0.79864 * up.y + 0.60182 * up.x;   // cross((cos -37, sin -37), up)
  float beforeHigh = 0.97196 * up.y - 0.23514 * up.x; // cross(up, (cos 13.6, sin 13.6)) negated
  if (up.x > 0.0 && afterLow > 0.0 && beforeHigh < 0.0) return vec3(0.0);
  float s = dot(w, markAcross);
  if (q.x < 0.0 && s > -19.2 && s < 55.5) return vec3(0.0);
  return vec3(1.0, (r - markRi) / (markRo - markRi), 0.0);
}
`;

const FIELD = `${MARK}
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 centre = vec2(beamMark.x * aspect, beamMark.y);
  vec2 light = vec2(beamLight.x * aspect, beamLight.y);
  vec2 cell = uv * res;

  // Logo space for this cell, and how many cells one logo unit covers.
  float unitCells = beamMark.z * res.y / 453.0;
  vec2 rel = p - centre;
  vec2 L = markCentre + vec2(rel.x, -rel.y) * (453.0 / beamMark.z);

  // Ambient: a measurement grid the cursor lights up.
  vec2 gridCell = mod(cell, 16.0);
  float dot16 = step(gridCell.x, 0.99) * step(gridCell.y, 0.99);
  float toLight = length((uv - beamLight) * res);
  float reveal = exp(-toLight * toLight / 1600.0) * beamReveal;
  float grid = dot16 * mix(0.5 * beamAmbient, 1.0, reveal);
  float backdrop = grid;

  // The beam: the crossbar carried on across the screen, with dust in it.
  vec2 w = L - markP0;
  float across = (dot(w, markAcross) - markBarWidth * 0.5) * unitCells;
  float beamHalf = min(markBarWidth * 0.5 * unitCells, res.y * 0.09);
  float along = dot(w, markAlong) * unitCells;
  float core = exp(-pow(max(abs(across) - beamHalf * 0.35, 0.0) / (beamHalf * 0.35 + 1.0), 2.0));
  float halo = exp(-abs(across) / (beamHalf * 1.6 + 3.0)) * 0.22;
  float dust = fbm(vec2(along * 0.016 - t * 0.55, across * 0.14));
  // Quieter where the beam passes through the mark's own crossbar.
  float clearOfMark = smoothstep(0.0, 40.0 * unitCells, abs(along - 262.0 * unitCells) - 262.0 * unitCells) * 0.65 + 0.35;
  float beam = (core * (0.2 + 0.55 * dust) + halo * dust) * beamIntensity * clearOfMark;

  float tone = max(backdrop, beam);

  // The mark itself, shaded as a solid lit by the cursor.
  vec3 m = markShape(L);
  if (m.x > 0.5 && beamMark.w > 0.0) {
    vec2 radial = normalize(vec2(L.x - markRingC.x, markRingC.y - L.y));
    vec2 dir = m.z > 0.5 ? vec2(-markAcross.x, markAcross.y) : radial;
    float bend = m.y * 3.14159265;
    vec3 n = normalize(vec3(dir * -cos(bend), sin(bend) * 1.9));
    vec3 l = normalize(vec3(light - p, 0.55));
    float diffuse = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
    float shade = clamp(0.3 + 0.55 * diffuse + 0.5 * spec, 0.0, 1.0);
    // Dissolve through the Bayer thresholds as it fades.
    tone = mix(tone, shade, beamMark.w);
  }
  return tone;
}
`;

export type BeamUniforms = {
  /** Mark centre (uv, y up), height as a fraction of the viewport, opacity. */
  beamMark: [number, number, number, number];
  /** Light position, uv with y up. Follows the pointer. */
  beamLight: [number, number];
  beamIntensity: number;
  beamAmbient: number;
  beamReveal: number;
};

type BeamFieldProps = Omit<DitherShaderProps, "field" | "colorField" | "uniforms"> & {
  /** Mutated in place every frame by the caller; read by the shader. */
  uniforms: BeamUniforms;
};

// Paper, a dim grey, then ink: tone 0.5 lands exactly on the grey, which the
// grid uses, and the lit mark dithers between grey and white.
const PALETTE = ["--background", "oklch(0.34 0 0)", "--foreground"] as const;

export const BeamField = ({ uniforms, ...props }: BeamFieldProps) => (
  <DitherShader
    matrix="bayer4"
    levels={17}
    palette={PALETTE}
    stillTime={6}
    {...props}
    field={FIELD}
    uniforms={uniforms}
  />
);
