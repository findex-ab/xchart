"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeXAxis = exports.computeYAxis = void 0;
const range_1 = require("../../types/range");
const etc_1 = require("../../utils/etc");
const vector_1 = require("../../utils/vector");
const types_1 = require("./types");
const computeYAxis = (app, data, values_, ctx, options = types_1.defaultLineChartOptions, metrics) => {
    const { vh, peak, mid, h, padding } = metrics;
    let maxTextWidth = 0;
    const values = [...values_].sort();
    let points = [];
    const config = options.yAxis || {};
    const av = (0, etc_1.avg)(values);
    const max = Math.round(vh);
    const step = Math.max(Math.floor((max / (peak / (av / 2))) / 2), 10);
    let prevIndex = -1;
    for (let i = 0; i < max; i += step) {
        const ni = i / max;
        let index = Math.floor(ni * (values.length - 1));
        // if (index === prevIndex) index += 1;
        // if (Math.abs(index - prevIndex) >= 2) index -= 1;
        // index = clamp(index, 0, values.length-1);
        prevIndex = index;
        const x = 0;
        const y = Math.floor(max - (ni * max));
        const ny = y / max;
        // index = Math.floor(ny*(values.length-1));
        index = (0, etc_1.clamp)((values.length - 1) - index, 0, values.length - 1);
        const value = Math.floor((peak) - ny * peak);
        if (y <= (padding.top + 16))
            break;
        ctx.font = metrics.font;
        const text = options.yAxis && options.yAxis.format
            ? options.yAxis.format(value)
            : `${value.toFixed(2)}`;
        const m = ctx.measureText(text);
        maxTextWidth = Math.max(maxTextWidth, m.width);
        points.push({
            p: (0, vector_1.VEC2)(x, y),
            value: value,
            label: text,
            textWidth: m.width,
        });
    }
    // const max = Math.max(1, peak);
    // const step = Math.max(1, Math.floor(mid / vh) * 2);
    // const N = max / step;
    // let y = vh - padding.bottom;
    // for (let i = 0; i < N; i++) {
    //   if (y <= padding.top + 16) break;
    //   const ny = (h - padding.bottom - y) / (vh - padding.top);
    //   const value = ny * peak;
    //   const text =
    //     options.yAxis && options.yAxis.format
    //       ? options.yAxis.format(value)
    //       : `${value.toFixed(2)}`;
    //   ctx.font = metrics.font;
    //   const m = ctx.measureText(text);
    //   maxTextWidth = Math.max(maxTextWidth, m.width);
    //   points.push({
    //     p: VEC2(0, y),
    //     value,
    //     label: text,
    //     textWidth: m.width,
    //   });
    //   y -= step;
    // }
    points.forEach((point, i) => {
        point.p.x += maxTextWidth;
    });
    return { points, config, maxTextWidth };
};
exports.computeYAxis = computeYAxis;
const computeXAxis = (app, data, ctx, options = types_1.defaultLineChartOptions, metrics) => {
    var _a;
    const { vw, w, h, padding } = metrics;
    let points = [];
    const config = options.xAxis || {};
    let maxTextWidth = 0;
    const xAxisItems = [
        ...(options.xAxis ? (0, range_1.rangeToArray)(options.xAxis.range) : []),
    ];
    const divisor = ((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.divisor) || 12;
    const step = Math.floor(vw / divisor);
    for (let i = 0; i < vw; i += step) {
        const ni = i / vw;
        let index = ((ni * xAxisItems.length) + xAxisItems.length * (metrics.padding.left / (vw))) - (1 * (metrics.padding.left / vw));
        const item = xAxisItems[(0, etc_1.clamp)(Math.round(index), 0, xAxisItems.length - 1)];
        const x = padding.left + (ni * vw);
        if (x >= vw)
            break;
        const y = h - padding.bottom;
        let text = '';
        try {
            text = options.xAxis.format ? options.xAxis.format(item) : `${item}`;
        }
        catch (e) {
            text = '?';
        }
        const m = ctx.measureText(text);
        maxTextWidth = Math.max(maxTextWidth, m.width);
        points.push({
            p: (0, vector_1.VEC2)(x, y),
            value: ni,
            label: text,
            textWidth: m.width,
        });
    }
    //for (let i = 0; i < xAxisItems.length; i++) {
    //  const item = xAxisItems[i];
    //  const ni = i / xAxisItems.length;
    //  const x = padding.left + ni * vw;
    //  const y = h - padding.bottom;
    //  const text = options.xAxis.format ? options.xAxis.format(item) : `${item}`;
    //  const m = ctx.measureText(text);
    //  maxTextWidth = Math.max(maxTextWidth, m.width);
    //  points.push({
    //    p: VEC2(x, y),
    //    value: ni,
    //    label: text,
    //    textWidth: m.width,
    //  });
    //}
    return { points, config, maxTextWidth };
};
exports.computeXAxis = computeXAxis;
