import { rangeToArray } from '../../types/range';
import { clamp, lerp, remap, stepRange, } from '../../utils/etc';
import { VEC2 } from '../../utils/vector';
import * as fns from 'date-fns';
import { defaultLineChartOptions } from './types';
import { isDate } from '../../utils/date';
import { isString } from '../../utils/is';
// draw line from A to B
const drawLine = (ctx, a, b, color = 'black') => {
    ctx.save();
    ctx.strokeStyle = color;
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
        const b = points[clamp(i + 1, 0, points.length - 1)];
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
        const b = points[clamp(i + 1, 0, points.length - 1)];
        const c = a.lerp(b, 0.5);
        result.push([a, c]);
    }
    return result;
};
const drawCurve2 = (ctx, points, w, h, padding) => {
    if (points.length <= 0)
        return;
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(...points[0].xy);
    for (let i = 0; i < points.length - 2; i += 1) {
        const a = points[i];
        const b = points[clamp(i + 1, 0, points.length - 1)];
        const c = a.lerp(b, 0.5);
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
const drawPoint = (ctx, point, color = 'red') => {
    ctx.save();
    ctx.fillStyle = color;
    const r = 10;
    ctx.beginPath();
    ctx.arc(point.x - (r * 0.5), point.y, r, 0, Math.PI * 2);
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
export const lineChart = (app, data, options = defaultLineChartOptions) => {
    const yValues = data.values.map((v) => Math.max(0, v));
    const xValues = (options.xAxis ? rangeToArray(options.xAxis.range) : data.labels || []) ||
        data.labels ||
        yValues;
    if (yValues.length <= 0 || xValues.length <= 0)
        return () => { };
    const peakY = Math.max(...yValues);
    const minY = Math.min(...yValues);
    let peakX = 0;
    let minX = 0;
    if (isDate(xValues[0])) {
        const dates = [...xValues];
        const sorted = dates.sort((a, b) => fns.compareAsc(a, b));
        peakX = sorted[sorted.length - 1].getTime();
        minX = sorted[0].getTime();
    }
    const formatX = (x) => {
        if (options.xAxis?.format)
            return options.xAxis.format(x);
        return isString(x) ? x : isDate(x) ? fns.format(x, 'y-m-d') : x.toFixed(2);
    };
    const formatY = (y) => {
        if (options.yAxis?.format)
            return options.yAxis.format(y);
        return isString(y) ? y : isDate(y) ? fns.format(y, 'y-m-d') : y.toFixed(2);
    };
    return (instance) => {
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
        const numXTicks = options.xAxis?.ticks || clamp(Math.log10(size.x * 10), 4, 100);
        const numYTicks = Math.floor(options.yAxis?.ticks ||
            clamp(Math.log10(peakY), Math.max(1, 4 * (size.x / vh)), 100));
        const yStep = Math.max(1, Math.ceil(vh / numYTicks));
        const yTicks = stepRange(vh, yStep);
        const yTickValues = yTicks.map((i) => lerp(0, peakY, i / ((yTicks.length - 1) * yStep)));
        const yTickObjects = yTicks.map((i) => {
            return {
                text: formatY(yTickValues[Math.floor(i / yStep)]),
                value: yTickValues[Math.floor(i / yStep)],
                pos: VEC2(padding.left, vh - i - padding.bottom),
            };
        });
        const yTickMeasures = yTickObjects.map((obj) => measureText(ctx, obj));
        const yTickWidths = yTickMeasures.map((m) => m.width);
        const maxYTickWidth = Math.max(...yTickWidths);
        padding.left += maxYTickWidth;
        yTickObjects.forEach((obj) => {
            drawText(ctx, obj);
            drawLine(ctx, VEC2(obj.pos.x, obj.pos.y), VEC2(obj.pos.x + size.x, obj.pos.y));
        });
        // ===================== X ticks
        const w = remap(instance.resolution.x, 0, instance.resolution.x, padding.left, instance.resolution.x - padding.right); //instance.resolution.x - padding.left;
        const xStep = Math.max(1, Math.round((w + padding.left) / numXTicks));
        const xTicks = stepRange(w - padding.left, xStep);
        const xTickValues = xTicks.map((i) => new Date(lerp(minX, peakX, i / ((xTicks.length - 1) * xStep))));
        const xTickObjects = xTicks.map((i) => {
            return {
                text: formatX(xTickValues[Math.floor(i / xStep)]),
                value: xTickValues[Math.floor(i / xStep)],
                pos: VEC2(padding.left + i, vh + padding.bottom - textMarginBottom),
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
            const nv = remap(value, minY, peakY, 0, 1);
            const ni = i / yValues.length;
            const xIndex = clamp(Math.floor(ni * (xTickObjects.length - 1)), 0, xTickObjects.length - 1);
            const yIndex = clamp(Math.floor(ni * (yTickObjects.length - 1)), 0, yTickObjects.length - 1);
            const xObj = xTickObjects[xIndex];
            const yObj = yTickObjects[yIndex];
            //const y = (h - padding.bottom) - (nv * (h - (padding.bottom + padding.top)));//Math.floor(nv*(h - (padding.bottom+padding.top)));
            //const x = xObj.pos.x;
            //const y = yObj.pos.y;
            const yPositions = yTickObjects.map((obj) => obj.pos);
            const yComponents = yPositions.map((p) => p.y);
            const maxYPos = Math.max(...yComponents);
            const minYPos = Math.min(...yComponents);
            let x = padding.left + ni * (w - padding.left * 0.5);
            let y = remap(value, minY, peakY, maxYPos, minYPos);
            const pos = VEC2(x, y);
            //    const dist = pos.distance(instance.mouse);
            //      pos.y -= 100.0 * smoothstep(200, 0.0, dist);
            //const y = (vh - (nv * vh));//minYPos + (nv * (maxYPos - minYPos));//remap(nv, 0, 1, minYPos, maxYPos);
            //const y = remap(value, minY, peakY, Math.min(...yTickObjects.map(it => it.pos.y)), Math.max(...yTickObjects.map(it => it.pos.y)));
            points.push(pos);
        }
        const curvePoints = createCurvePoints(points);
        drawCurve2(ctx, points, w, h - padding.bottom, padding);
        const left = padding.left;
        const right = w;
        const getMousePointIndex = () => {
            const ni = (Math.floor(instance.mouse.x) - padding.left) /
                (w - padding.left);
            return clamp(Math.round(ni * (points.length - 1)), 0, points.length - 1);
        };
        const mouseInteraction = () => {
            const nx = clamp(Math.max(0, (instance.mouse.x / instance.canvas.width) * (right - left) -
                maxYTickWidth) /
                (w - 2 * padding.left), 0, 1);
            const valueIndex = Math.round(clamp(nx * (yValues.length - 1), 0, yValues.length - 1));
            const value = yValues[valueIndex];
            const idx = getMousePointIndex();
            const point = (curvePoints[idx][1] || curvePoints[idx][0]).clone();
            drawPoint(ctx, VEC2(lerp(point.x, instance.mouse.x, 0.5), point.y), options.pointColor || 'red');
            const updateTooltip = () => {
                const rect = instance.canvas.getBoundingClientRect();
                const tooltipRect = instance.tooltip.el
                    ? instance.tooltip.el.getBoundingClientRect()
                    : { width: 0, height: 0, x: 0, y: 0 };
                const rx = instance.canvas.width / rect.width;
                const ry = instance.canvas.height / rect.height;
                const x = lerp(rect.x + (point.x / rx), app.mouse.x, 0.5);
                instance.tooltip.state.position = app.mouse.clone();
                instance.tooltip.state.position.y = rect.y + (point.y / ry);
                instance.tooltip.state.position.x = x;
                instance.tooltip.state.position.y -= tooltipRect.height;
                instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
            };
            //   drawLine(ctx, VEC2(left, vh/2), VEC2(right, vh/2));
            updateTooltip();
            if (options.callback) {
                options.callback(instance, value, value, value);
            }
        };
        mouseInteraction();
        return {};
    };
};
