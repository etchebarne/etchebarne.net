// Elevintia: "Elevating what connects us." The chevron from its mark,
// repeated and rising: each one a solid wedge, thick at the apex and tapering
// to points, nested at the logo's spacing. They dissolve as they climb.
export const ELEVINTIA_FIELD = `
// 1.0 inside a chevron with its apex at (cx, apex), y up.
float elevChevron(vec2 p, float cx, float apex) {
  float height = 0.78;
  float halfWidth = height * 0.6;
  float apexThickness = height * 0.24;
  float x = abs(p.x - cx) / halfWidth;
  if (x > 1.0) return 0.0;
  float outer = apex - x * height;
  // The inner edge curves slightly, so the stroke tapers to a sharp point.
  float inner = apex - apexThickness - (height - apexThickness) * pow(x, 0.82);
  return step(inner, p.y) * step(p.y, outer);
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float cx = aspect * 0.5;
  float spacing = 0.31;
  float tone = 0.0;

  for (int i = 0; i < 7; i++) {
    float k = float(i);
    // Each chevron climbs from below the frame to above it, then starts again.
    float life = fract(k / 7.0 + t * 0.05);
    float apex = mix(-0.25, -0.25 + spacing * 7.0, life);
    // Fully solid low down, dissolving through the dither as it rises.
    float fade = 1.0 - smoothstep(0.75, 1.45, apex);
    tone = max(tone, elevChevron(p, cx, apex) * fade);
  }
  return tone;
}
`;
