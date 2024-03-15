"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineChart2 = void 0;
const range_1 = require("../../types/range");
const etc_1 = require("../../utils/etc");
const vector_1 = require("../../utils/vector");
const fns = __importStar(require("date-fns"));
const types_1 = require("./types");
const date_1 = require("../../utils/date");
const is_1 = require("../../utils/is");
const hash_1 = require("../../utils/hash");
// draw line from A to B
const drawLine = (ctx, a, b, color = 'black', thick = 1) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
};
const drawText = (ctx, options) => {
    const font = options.font || `1rem sans-serif`;
    const color = options.color || 'black';
    const text = options.text;
    const pos = options.pos;
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillText(text + '', pos.x, pos.y);
    ctx.closePath();
    ctx.restore();
};
const drawPoints = (ctx, points) => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(0, etc_1.clamp)(i + 1, 0, points.length - 1)];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
};
const drawCurve = (ctx, points) => {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const point of points) {
        const xMid = (point.x + point.x) / 2;
        const yMid = (point.y + point.y) / 2;
        const cpX1 = (xMid + point.x) / 2;
        const cpX2 = (xMid + point.x) / 2;
        ctx.quadraticCurveTo(cpX1, point.y, xMid, yMid);
        ctx.quadraticCurveTo(cpX2, point.y, point.x, point.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
const createCurvePoints = (points) => {
    let result = [];
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(0, etc_1.clamp)(i + 1, 0, points.length - 1)];
        const c = a.lerp(b, 0.5);
        result.push([a, c]);
    }
    return result;
};
const drawCurve2 = (ctx, points, w, h, padding, colors = ['#FF0000', '#00FF00']) => {
    colors = colors || ['#FF0000', '#00FF00'];
    if (points.length <= 0)
        return;
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(...points[0].xy);
    for (let i = 0; i < points.length - 2; i += 1) {
        const a = points[i];
        const b = points[(0, etc_1.clamp)(i + 1, 0, points.length - 1)];
        const c = a.lerp(b, 0.5);
        const first = points[0];
        const last = points[points.length - 1];
        const strokeGrad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
        const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
        colors.forEach((color, i) => {
            strokeGrad.addColorStop(i / colors.length, color);
        });
        const ci = (0, hash_1.hexToUint32)(colors[2 % colors.length]);
        const B = (0, hash_1.nthByte)(ci, 1);
        const G = (0, hash_1.nthByte)(ci, 2);
        const R = (0, hash_1.nthByte)(ci, 3);
        const rgb = (0, vector_1.VEC3)(R, G, B);
        fillGrad.addColorStop(1, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.25})`);
        fillGrad.addColorStop(0.5, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.75})`);
        fillGrad.addColorStop(0, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${1.0})`);
        ctx.strokeStyle = strokeGrad;
        ctx.fillStyle = fillGrad;
        ctx.quadraticCurveTo(a.x, a.y, c.x, c.y);
        //    ctx.lineTo(c.x, c.y);
        //const xc = (a.p.x + b.p.x) * 0.5;
        //const yc = (a.p.y + b.p.y) * 0.5;
    }
    let i = points.length - 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    const padY = padding.bottom + padding.top;
    ctx.quadraticCurveTo(points[i + 1].x, points[i + 1].y, w, h - padY);
    ctx.quadraticCurveTo(w, h - padY, padding.left, h - padY);
    //ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
const drawPoint = (ctx, point, color = 'red', radius = 10) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
const measureText = (ctx, options) => {
    const font = options.font || `1rem sans-serif`;
    const text = options.text;
    ctx.save();
    ctx.font = font;
    const m = ctx.measureText(text + '');
    ctx.restore();
    return m;
};
const lineChart2 = (app, data, options = types_1.defaultLineChartOptions) => {
    const yValues = data.values.map((v) => v);
    const xValues = (options.xAxis ? (0, range_1.rangeToArray)(options.xAxis.range) : data.labels || []) ||
        data.labels ||
        yValues;
    if (yValues.length <= 0 || xValues.length <= 0)
        return () => { };
    const peakY = Math.max(...yValues);
    const minY = Math.min(...yValues);
    let peakX = 0;
    let minX = 0;
    if ((0, date_1.isDate)(xValues[0]) || ((0, is_1.isString)(xValues[0]) && xValues[0].includes('T') && xValues[0].includes('Z'))) {
        const dates = [...xValues].map(it => new Date(it));
        const sorted = dates.sort((a, b) => fns.compareAsc(a, b));
        peakX = sorted[sorted.length - 1].getTime();
        minX = sorted[0].getTime();
    }
    const formatX = (x) => {
        var _a;
        if ((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.format)
            return options.xAxis.format(x);
        return (0, is_1.isString)(x) ? x : (0, date_1.isDate)(x) ? fns.format(x, 'y-m-d') : x.toFixed(2);
    };
    const formatY = (y) => {
        var _a;
        if ((_a = options.yAxis) === null || _a === void 0 ? void 0 : _a.format)
            return options.yAxis.format(y);
        return (0, is_1.isString)(y) ? y : (0, date_1.isDate)(y) ? fns.format(y, 'y-m-d') : y.toFixed(2);
    };
    const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';
    let tooltipPos = app.mouse.clone();
    let tooltipPosPrev = tooltipPos.clone();
    const colors = options.colors || types_1.defaultLineChartOptions.colors;
    return (instance) => {
        var _a;
        const rect = instance.canvas.getBoundingClientRect();
        const rx = instance.canvas.width / rect.width;
        const ry = instance.canvas.height / rect.height;
        const paddingAround = 10;
        const padding = {
            left: 0,
            right: paddingAround / 2,
            top: paddingAround * 2,
            bottom: paddingAround * 2,
        };
        const textMarginBottom = paddingAround;
        //    padding.bottom = lerp(padding.bottom, padding.bottom*2, 0.5+0.5*Math.sin(app.time*0.003));
        const ctx = instance.ctx;
        // ===================== Y ticks
        const size = instance.resolution;
        const h = size.y;
        const vh = h - (padding.bottom + padding.top);
        const numYTicks = Math.floor(((_a = options.yAxis) === null || _a === void 0 ? void 0 : _a.ticks) ||
            (0, etc_1.clamp)(Math.log10(peakY), Math.max(1, 4 * (size.x / vh)), 100));
        const yStep = Math.max(1, Math.ceil(vh / numYTicks));
        const yTicks = (0, etc_1.stepRange)(vh, yStep);
        const yTickValues = yTicks.map((st) => (0, etc_1.lerp)(minY, peakY, st / ((yTicks.length - 1) * yStep)));
        const yTickObjects = yTicks.map((st, i) => {
            var _a, _b;
            return {
                text: formatY(yTickValues[i]),
                value: yTickValues[i],
                pos: (0, vector_1.VEC2)(padding.left, (vh - st) - padding.bottom),
                font: (_a = options.yAxis) === null || _a === void 0 ? void 0 : _a.font,
                color: (_b = options.yAxis) === null || _b === void 0 ? void 0 : _b.color
            };
        });
        const yTickMeasures = yTickObjects.map((obj) => measureText(ctx, obj));
        const yTickWidths = yTickMeasures.map((m) => m.width);
        const maxYTickWidth = Math.max(...yTickWidths);
        padding.left += (maxYTickWidth + 8);
        yTickObjects.forEach((obj) => {
            drawText(ctx, Object.assign(Object.assign({}, obj), { pos: obj.pos.add((0, vector_1.VEC2)(0, -4)) }));
            drawLine(ctx, (0, vector_1.VEC2)(obj.pos.x, obj.pos.y), (0, vector_1.VEC2)(obj.pos.x + (size.x - 0.5 * padding.left), obj.pos.y), GRID_COLOR, 2);
        });
        // ===================== X ticks
        const w = (0, etc_1.remap)(instance.resolution.x, 0, instance.resolution.x, padding.left, instance.resolution.x - padding.right); //instance.resolution.x - padding.left;
        const xTickObjects = xValues.map((v, i) => {
            var _a, _b;
            return {
                text: formatX(v),
                value: v,
                pos: (0, vector_1.VEC2)(padding.left + (i * 100), vh + padding.bottom - textMarginBottom),
                font: (_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.font,
                color: (_b = options.xAxis) === null || _b === void 0 ? void 0 : _b.color
            };
        });
        //const xTickMeasures = xTickObjects.map(obj => measureText(ctx, obj));
        xTickObjects.forEach((obj) => {
            drawText(ctx, obj);
        });
        // =================== points
        let points = [];
        //for (let i = 0; i < xTickObjects.length; i++) {
        //  const xObj = xTickObjects[i];
        //  const x = xObj.pos.x;
        //  const nx = x / w;
        //  const coord = nx * yValues.length;
        //  const yIndex = Math.floor(coord);
        //  const lv = fract(coord);
        //  let y = yValues[clamp(yIndex, 0, yValues.length-1)];
        //  y /= peakY;
        //  y *= h;
        //  y = h - y;
        //  points.push(VEC2(x, y));
        //}
        for (let i = 0; i < yValues.length; i++) {
            const value = yValues[i];
            const nv = (0, etc_1.remap)(value, minY, peakY, 0, 1);
            const ni = i / yValues.length;
            //  const xIndex = clamp(
            //    Math.floor(ni * (xTickObjects.length - 1)),
            //    0,
            //    xTickObjects.length - 1,
            //  );
            //  const yIndex = clamp(
            //    Math.floor(ni * (yTickObjects.length - 1)),
            //    0,
            //    yTickObjects.length - 1,
            //  );
            //  const xObj = xTickObjects[xIndex];
            //  const yObj = yTickObjects[yIndex];
            //const y = (h - padding.bottom) - (nv * (h - (padding.bottom + padding.top)));//Math.floor(nv*(h - (padding.bottom+padding.top)));
            //const x = xObj.pos.x;
            //const y = yObj.pos.y;
            const yPositions = yTickObjects.map((obj) => obj.pos);
            const yComponents = yPositions.map((p) => p.y);
            const maxYPos = Math.max(...yComponents);
            const minYPos = Math.min(...yComponents);
            let x = padding.left + ni * (w - padding.left * 0.5);
            let y = (0, etc_1.remap)(value, minY, peakY, maxYPos, minYPos);
            const pos = (0, vector_1.VEC2)(x, y);
            //    const dist = pos.distance(instance.mouse);
            //      pos.y -= 100.0 * smoothstep(200, 0.0, dist);
            //const y = (vh - (nv * vh));//minYPos + (nv * (maxYPos - minYPos));//remap(nv, 0, 1, minYPos, maxYPos);
            //const y = remap(value, minY, peakY, Math.min(...yTickObjects.map(it => it.pos.y)), Math.max(...yTickObjects.map(it => it.pos.y)));
            points.push(pos);
        }
        // const curvePoints = createCurvePoints(points);
        drawCurve2(ctx, points, w, h - padding.bottom, padding, colors || []);
        const left = padding.left;
        const right = w;
        const getMousePointIndex = () => {
            let mx = (app.mouse.x - rect.x);
            const L = padding.left;
            const R = right;
            mx = mx / (rect.width);
            mx *= (R - 0.5 * L);
            mx -= L;
            const ww = Math.abs((R - L));
            const ni = (0, etc_1.clamp)(mx / ww, 0, 1);
            //const ni = clamp(
            //  Math.floor((remap(instance.mouse.x, 0, instance.canvas.width,
            //        left, right
            //  ))) / Math.abs(right),
            //  0,
            //  1,
            //); 
            return (0, etc_1.clamp)(Math.ceil((ni * (points.length))), 0, points.length - 1);
        };
        const getCoord = (pos) => {
            const x = (() => {
                const numSteps = xValues.length;
                const stepSize = Math.ceil(size.x / numSteps);
                return Math.floor(pos.x / stepSize) * stepSize;
            })();
            const y = (() => {
                const numSteps = yValues.length;
                const stepSize = Math.ceil(size.y / numSteps);
                return Math.floor(pos.y / stepSize) * stepSize;
            })();
            return (0, vector_1.VEC2)(x, y);
        };
        const getDataCoord = (pos) => {
            const coord = getCoord(pos);
            const ix = (0, etc_1.clamp)(Math.floor(coord.x / Math.ceil(size.x / xValues.length)), 0, xValues.length - 1);
            const iy = (0, etc_1.clamp)((yValues.length - 1) - Math.floor(coord.y / Math.ceil(size.y / yValues.length)), 0, yValues.length - 1);
            return (0, vector_1.VEC2)(ix, iy);
        };
        const drawStuff = () => {
            const xy = getCoord(instance.mouse);
            drawText(ctx, {
                text: `${Math.floor(xy.x / Math.ceil(w / xValues.length))} | ${xValues.length}`,
                color: 'black',
                pos: (0, vector_1.VEC2)(w / 2, h / 2)
            });
            const drawRealX = () => {
                const numSteps = xValues.length;
                const stepSize = Math.ceil(w / numSteps);
                let x = instance.mouse.x;
                x = Math.floor(x / stepSize) * stepSize;
                drawPoint(ctx, (0, vector_1.VEC2)(x, vh - 30), 'green', 10);
                for (let i = 0; i < numSteps; i++) {
                    drawLine(ctx, (0, vector_1.VEC2)(i * stepSize, vh - 8), (0, vector_1.VEC2)(i * stepSize, vh - 60), 'red', 2);
                }
            };
            const drawRealY = () => {
                const numSteps = yValues.length;
                const stepSize = Math.ceil(h / numSteps);
                let y = instance.mouse.y;
                y = Math.floor(y / stepSize) * stepSize;
                drawPoint(ctx, (0, vector_1.VEC2)(0, y), 'green', 10);
                for (let i = 0; i < numSteps; i++) {
                    drawLine(ctx, (0, vector_1.VEC2)(0, i * stepSize), (0, vector_1.VEC2)(60, i * stepSize), 'blue', 2);
                }
            };
            drawRealX();
            //drawRealY();
            drawPoint(ctx, (0, vector_1.VEC2)(xy.x, xy.y), 'purple', 10);
            //drawTickX();
        };
        drawStuff();
        const mouseInteraction = () => {
            drawLine(ctx, (0, vector_1.VEC2)(instance.mouse.x, vh), (0, vector_1.VEC2)(instance.mouse.x, 0), GRID_COLOR, 2);
            let mx = (app.mouse.x - rect.x);
            const L = padding.left;
            const R = right;
            mx = mx / (rect.width);
            mx *= (R - 0.5 * L);
            mx -= L;
            const ww = Math.abs((R - L));
            const nx = (0, etc_1.clamp)(mx / ww, 0, 1);
            //const nx = clamp(
            //  Math.max(
            //    0,
            //    (instance.mouse.x / instance.canvas.width) * (right - left) -
            //      maxYTickWidth,
            //  ) /
            //    (w - 2 * padding.left),
            //  0,
            //  1,
            //);
            const valueIndex = Math.round((0, etc_1.clamp)(nx * (yValues.length - 1), 0, yValues.length - 1));
            const xValueIndex = ((0, etc_1.clamp)(Math.floor(nx * (xValues.length)), 0, xValues.length - 1));
            const value = yValues[valueIndex];
            const key1 = xValues[xValueIndex];
            const key = key1;
            const idx = getMousePointIndex();
            const point = points[idx] || (0, vector_1.VEC2)(0, 0); //(curvePoints[idx][1] || curvePoints[idx][0]).clone();
            drawPoint(ctx, (0, vector_1.VEC2)((0, etc_1.lerp)(point.x, instance.mouse.x, 0.5), point.y), options.pointColor || 'red', 8);
            const updateTooltip = () => {
                const tooltipRect = instance.tooltip.el
                    ? instance.tooltip.el.getBoundingClientRect()
                    : { width: 0, height: 0, x: 0, y: 0 };
                const x = (0, etc_1.lerp)(rect.x + (point.x / rx), app.mouse.x, 0.5);
                const y = Math.min((rect.y + (point.y / ry)) - tooltipRect.height, app.mouse.y);
                const nextTooltipPos = (0, vector_1.VEC2)(x, y);
                const pos = tooltipPosPrev.lerp(nextTooltipPos, (0, etc_1.clamp)(app.deltaTime * 8.0, 0, 1));
                tooltipPosPrev = pos;
                instance.tooltip.state.position = pos;
                instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
            };
            //   drawLine(ctx, VEC2(left, vh/2), VEC2(right, vh/2));
            updateTooltip();
            if (options.callback) {
                options.callback(instance, key, value, valueIndex);
            }
        };
        mouseInteraction();
        return {};
    };
};
exports.lineChart2 = lineChart2;
