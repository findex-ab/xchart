"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.median = exports.avg = exports.sum = exports.range = exports.smax = exports.smin = exports.slt = exports.sgt = exports.smoothstep = exports.fract = exports.clamp = exports.lerp = void 0;
const lerp = (vFrom, vTo, scale) => {
    return vFrom + (vTo - vFrom) * scale;
};
exports.lerp = lerp;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
exports.clamp = clamp;
const fract = (x) => x - Math.floor(x);
exports.fract = fract;
const smoothstep = (edge0, edge1, value) => {
    const x = (0, exports.clamp)((value - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
};
exports.smoothstep = smoothstep;
const sgt = (a, b, s) => {
    const h = (0, exports.clamp)(0.5 + (0.5 * (a - b)) / s, 0.0, 1.0);
    return (0, exports.lerp)(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
exports.sgt = sgt;
const slt = (a, b, s) => {
    const h = (0, exports.clamp)(0.5 + (0.5 * (b - a)) / s, 0.0, 1.0);
    return (0, exports.lerp)(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
exports.slt = slt;
const smin = (a, b, k) => {
    const h = (0, exports.clamp)(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return (0, exports.lerp)(b, a, h) - k * h * (1.0 - h);
};
exports.smin = smin;
const smax = (a, b, k) => {
    const h = (0, exports.clamp)(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return (0, exports.lerp)(b, a, h) + k * h * (1.0 - h);
};
exports.smax = smax;
const range = (n) => Array.from(Array(n).keys());
exports.range = range;
const sum = (arr) => arr.reduce((a, b) => (a + b), 0);
exports.sum = sum;
const avg = (arr) => arr.length <= 0 ? 0 : ((0, exports.sum)(arr) / arr.length);
exports.avg = avg;
const median = (arr) => arr.length <= 0 ? 0 : [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
exports.median = median;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXRjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3hjaGFydC91dGlscy9ldGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFhLEVBQUUsR0FBVyxFQUFFLEtBQWEsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUN2QyxDQUFDLENBQUM7QUFGVyxRQUFBLElBQUksUUFFZjtBQUVLLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBYSxFQUFFLEdBQVcsRUFBRSxHQUFXLEVBQUUsRUFBRSxDQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRHpCLFFBQUEsS0FBSyxTQUNvQjtBQUMvQixNQUFNLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBekMsUUFBQSxLQUFLLFNBQW9DO0FBRS9DLE1BQU0sVUFBVSxHQUFHLENBQ3hCLEtBQWEsRUFDYixLQUFhLEVBQ2IsS0FBYSxFQUNMLEVBQUU7SUFDVixNQUFNLENBQUMsR0FBRyxJQUFBLGFBQUssRUFBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqQyxDQUFDLENBQUM7QUFQVyxRQUFBLFVBQVUsY0FPckI7QUFFSyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxF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