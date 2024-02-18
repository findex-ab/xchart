export const lerp = (vFrom: number, vTo: number, scale: number) => {
  return vFrom + (vTo - vFrom) * scale;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const fract = (x: number) => x - Math.floor(x);

export const smoothstep = (
  edge0: number,
  edge1: number,
  value: number
): number => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
  return x * x * (3.0 - 2.0 * x);
};

export const sgt = (a: number, b: number, s: number) => {
  const h = clamp(0.5 + (0.5 * (a - b)) / s, 0.0, 1.0);
  return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};

export const slt = (a: number, b: number, s: number) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / s, 0.0, 1.0);
  return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};

export const smin = (a: number, b: number, k: number) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
  return lerp(b, a, h) - k * h * (1.0 - h);
};

export const smax = (a: number, b: number, k: number) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
  return lerp(b, a, h) + k * h * (1.0 - h);
};

export const range = (n: number): number[] => Array.from(Array(n).keys());

export const sum = (arr: number[]): number => arr.reduce((a, b) => (a + b), 0);
