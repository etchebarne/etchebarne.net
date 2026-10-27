// Vintia: its sparkle, alone. A large four-point star with concave sides,
// tilted so the top leans right, with a soft glow. It only breathes.
export const VINTIA_FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);

  // Rotate the space so the star appears turned about 22 degrees clockwise.
  float angle = 0.38;
  vec2 r = vec2(c.x * cos(angle) - c.y * sin(angle), c.x * sin(angle) + c.y * cos(angle));

  float breathe = 1.0 + 0.03 * sin(t * 0.8);
  vec2 s = abs(r) / (vec2(0.33, 0.39) * breathe);
  float star = pow(s.x, 0.6) + pow(s.y, 0.6);

  float body = 1.0 - step(1.0, star);
  // A soft round halo, like light around it.
  float glow = exp(-length(c) / 0.09) * 0.55 * (1.0 - body);
  return max(body, glow);
}
`;
