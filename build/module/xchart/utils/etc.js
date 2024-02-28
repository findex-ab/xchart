export const lerp = (vFrom, vTo, scale) => {
    return vFrom + (vTo - vFrom) * scale;
};
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const fract = (x) => x - Math.floor(x);
export const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
};
export const sgt = (a, b, s) => {
    const h = clamp(0.5 + (0.5 * (a - b)) / s, 0.0, 1.0);
    return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
export const slt = (a, b, s) => {
    const h = clamp(0.5 + (0.5 * (b - a)) / s, 0.0, 1.0);
    return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
export const smin = (a, b, k) => {
    const h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return lerp(b, a, h) - k * h * (1.0 - h);
};
export const smax = (a, b, k) => {
    const h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return lerp(b, a, h) + k * h * (1.0 - h);
};
export const range = (n) => Array.from(Array(n).keys());
export const sum = (arr) => arr.reduce((a, b) => (a + b), 0);
export const avg = (arr) => arr.length <= 0 ? 0 : (sum(arr) / arr.length);
export const median = (arr) => arr.length <= 0 ? 0 : [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
export const remap = (value, originalMin, originalMax, nextMin, nextMax) => nextMin + (((value - originalMin) / (originalMax - originalMin)) * (nextMax - nextMin));
