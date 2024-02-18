export var lerp = function (vFrom, vTo, scale) {
    return vFrom + (vTo - vFrom) * scale;
};
export var clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
};
export var fract = function (x) { return x - Math.floor(x); };
export var smoothstep = function (edge0, edge1, value) {
    var x = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
};
export var sgt = function (a, b, s) {
    var h = clamp(0.5 + (0.5 * (a - b)) / s, 0.0, 1.0);
    return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
export var slt = function (a, b, s) {
    var h = clamp(0.5 + (0.5 * (b - a)) / s, 0.0, 1.0);
    return lerp(0.0, 1.0, h * h * (3.0 - 2.0 * h));
};
export var smin = function (a, b, k) {
    var h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return lerp(b, a, h) - k * h * (1.0 - h);
};
export var smax = function (a, b, k) {
    var h = clamp(0.5 + (0.5 * (b - a)) / k, 0.0, 1.0);
    return lerp(b, a, h) + k * h * (1.0 - h);
};
export var range = function (n) { return Array.from(Array(n).keys()); };
export var sum = function (arr) { return arr.reduce(function (a, b) { return (a + b); }, 0); };
//# sourceMappingURL=etc.js.map