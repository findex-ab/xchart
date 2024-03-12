"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remapArray = exports.remap = exports.median = exports.avg = exports.sum = exports.rangeFromTo = exports.stepRange = exports.range = exports.smax = exports.smin = exports.slt = exports.sgt = exports.smoothstep = exports.fract = exports.clamp = exports.lerpDates = exports.lerp = void 0;
const date_1 = require("./date");
const lerp = (vFrom, vTo, scale, clampScale = false) => {
    scale = clampScale ? (0, exports.clamp)(scale, 0, 1) : scale;
    return vFrom + (vTo - vFrom) * scale;
};
exports.lerp = lerp;
const lerpDates = (vFrom, vTo, scale) => {
    vFrom = (0, date_1.isDate)(vFrom) ? vFrom : new Date(vFrom);
    vTo = (0, date_1.isDate)(vTo) ? vTo : new Date(vTo);
    return new Date((0, exports.lerp)(vFrom.getTime(), vTo.getTime(), scale));
};
exports.lerpDates = lerpDates;
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
const stepRange = (n, step = 1) => {
    const result = [];
    for (let i = 0; i < n; i += step) {
        result.push(i);
    }
    return result;
};
exports.stepRange = stepRange;
const rangeFromTo = (vFrom, vTo, step = 1) => {
    let result = [];
    let n = vFrom;
    while (n < vTo) {
        result.push(n);
        n += step;
    }
    return result;
};
exports.rangeFromTo = rangeFromTo;
const sum = (arr) => arr.reduce((a, b) => (a + b), 0);
exports.sum = sum;
const avg = (arr) => arr.length <= 0 ? 0 : ((0, exports.sum)(arr) / arr.length);
exports.avg = avg;
const median = (arr) => arr.length <= 0 ? 0 : [...arr].sort((a, b) => a - b)[Math.floor(arr.length / 2)];
exports.median = median;
const remap = (value, originalMin, originalMax, nextMin, nextMax) => nextMin + (((value - originalMin) / (originalMax - originalMin)) * (nextMax - nextMin));
exports.remap = remap;
const remapArray = (arr, nextMin, nextMax) => {
    return arr.map((_, i) => {
        const ni = i / arr.length;
        return (0, exports.lerp)(nextMin, nextMax, ni);
    });
};
exports.remapArray = remapArray;
