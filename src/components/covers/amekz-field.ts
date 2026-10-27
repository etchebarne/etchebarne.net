// Amekz: "Something is waiting in the dark." The studio's mark sits in
// darkness; a beam of light keeps sweeping across it, revealing it
// as it passes, then it's dark again.
//
// The mark is the two polygons from amekz.com/assets/favicon.svg (y down),
// 490 x 411 units, centred on (624.8, 505.3).
export const AMEKZ_FIELD = `
float amekzCross(vec2 p, vec2 a, vec2 b) {
  // 1.0 when a ray from p to the right crosses edge ab.
  if ((a.y > p.y) == (b.y > p.y)) return 0.0;
  float x = a.x + (p.y - a.y) / (b.y - a.y) * (b.x - a.x);
  return step(p.x, x);
}

float amekzSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float k = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * k);
}

// x: inside (0 or 1), y: distance to the nearest edge, in logo units.
vec2 amekzMark(vec2 p) {
  vec2 a0 = vec2(627.0, 299.6);
  vec2 a1 = vec2(379.8, 711.0);
  vec2 a2 = vec2(469.6, 711.0);
  vec2 a3 = vec2(627.1, 460.6);
  vec2 a4 = vec2(669.3, 536.5);
  vec2 a5 = vec2(647.7, 570.0);
  vec2 a6 = vec2(786.6, 570.0);
  float c1 = amekzCross(p, a0, a1) + amekzCross(p, a1, a2) + amekzCross(p, a2, a3) + amekzCross(p, a3, a4)
    + amekzCross(p, a4, a5) + amekzCross(p, a5, a6) + amekzCross(p, a6, a0);
  float d = min(min(min(amekzSeg(p, a0, a1), amekzSeg(p, a1, a2)), min(amekzSeg(p, a2, a3), amekzSeg(p, a3, a4))),
    min(min(amekzSeg(p, a4, a5), amekzSeg(p, a5, a6)), amekzSeg(p, a6, a0)));

  vec2 b0 = vec2(637.7, 586.8);
  vec2 b1 = vec2(652.3, 610.0);
  vec2 b2 = vec2(810.2, 610.0);
  vec2 b3 = vec2(869.8, 711.0);
  vec2 b4 = vec2(652.5, 711.0);
  vec2 b5 = vec2(611.3, 628.6);
  float c2 = amekzCross(p, b0, b1) + amekzCross(p, b1, b2) + amekzCross(p, b2, b3) + amekzCross(p, b3, b4)
    + amekzCross(p, b4, b5) + amekzCross(p, b5, b0);
  d = min(d, min(min(min(amekzSeg(p, b0, b1), amekzSeg(p, b1, b2)), min(amekzSeg(p, b2, b3), amekzSeg(p, b3, b4))),
    min(amekzSeg(p, b4, b5), amekzSeg(p, b5, b0))));

  float inside = max(mod(c1, 2.0), mod(c2, 2.0));
  return vec2(inside, d);
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // The mark fills 62% of the height; work in its units.
  float scale = 411.0 / 0.62;
  vec2 L = vec2(624.8, 505.3) + vec2(p.x, -p.y) * scale;
  vec2 mark = amekzMark(L);
  float unitsPerCell = scale / res.y;
  float edgeCells = mark.y / unitsPerCell;

  // A beam sweeps across the mark from left to right, then darkness for a
  // while before the next pass. Slightly tilted, eased in and out.
  // A 4.5 second loop: about 3.4 seconds of sweep, then a brief dark pause.
  float cycle = fract(t / 4.5);
  float sweep = smoothstep(0.0, 0.75, cycle);
  // Only across the mark itself (about 0.74 wide), so the beam is always lighting it.
  float beamX = mix(-0.62, 0.62, sweep);
  float across = (p.x - beamX) + p.y * 0.25;
  float lit = exp(-across * across / 0.035);
  lit *= 1.0 - smoothstep(0.72, 0.78, cycle);

  // The mark: faint in the dark, lit where the beam passes, with a bright rim.
  float rim = (1.0 - smoothstep(0.6, 1.6, edgeCells)) * mark.x;
  float body = mark.x * (0.07 + 0.88 * lit);
  float edge = rim * (0.2 + 0.8 * lit);
  float tone = max(body, edge);

  return tone;
}
`;
