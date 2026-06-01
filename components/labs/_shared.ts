export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 2) {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function buildLineGraphPath(points: { x: number; y: number }[], w: number, h: number, padding = 16) {
  if (points.length === 0) return "";
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dx = Math.max(1e-6, maxX - minX);
  const dy = Math.max(1e-6, maxY - minY);

  const toX = (x: number) => padding + ((x - minX) / dx) * (w - padding * 2);
  const toY = (y: number) => h - padding - ((y - minY) / dy) * (h - padding * 2);

  return points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${toX(p.x).toFixed(2)} ${toY(p.y).toFixed(2)}`)
    .join(" ");
}

