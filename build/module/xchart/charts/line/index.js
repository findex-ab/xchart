import { rangeToArray } from '../../types/range';
import { clamp, lerp, remap, stepRange, } from '../../utils/etc';
import { VEC2, VEC3 } from '../../utils/vector';
import * as fns from 'date-fns';
import { defaultLineChartOptions } from './types';
import { isDate } from '../../utils/date';
import { isNumber, isString } from '../../utils/is';
import { hexToUint32, nthByte } from '../../utils/hash';
import { isAllSame, uniqueBy } from '../../utils/array';
import { getPixel } from '../../utils/draw';
import { lineChart4 } from './line4';
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
        const b = points[clamp(i + 1, 0, points.length - 1)];
        const c = a.lerp(b, 0.5);
        const first = points[0];
        const last = points[points.length - 1];
        const strokeGrad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
        const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
        colors.forEach((color, i) => {
            strokeGrad.addColorStop(i / colors.length, color);
        });
        const ci = hexToUint32(colors[2 % colors.length]);
        const B = nthByte(ci, 1);
        const G = nthByte(ci, 2);
        const R = nthByte(ci, 3);
        const rgb = VEC3(R, G, B);
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
    points[i + 1].x = w;
    ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    const padY = padding.bottom + padding.top;
    ctx.quadraticCurveTo(points[i + 1].x, points[i + 1].y, w, h - padY);
    ctx.quadraticCurveTo(w, h - padY, padding.left, h - padY);
    //ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    //for (const point of points) {
    //  ctx.save()
    //  drawPoint(ctx, point, 'red', 10);
    //  ctx.restore();
    //}
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
export const lineChart = (app, data, options = defaultLineChartOptions) => {
    return lineChart4(app, data, options);
    //  return lineChart3(app, data, options);
    let tooltipPos = app.mouse.clone();
    let tooltipPosPrev = tooltipPos.clone();
    let prevPointPos = tooltipPos.clone();
    return (instance) => {
        const yValues = data.values.map((v) => v);
        const xValues = (options.xAxis ? rangeToArray(options.xAxis.range) : data.labels || []) ||
            data.labels ||
            yValues;
        if (yValues.length <= 0 || xValues.length <= 0)
            return () => { };
        const peakY = Math.max(...yValues);
        const minY = Math.min(...yValues);
        let peakX = 0;
        let minX = 0;
        if (isDate(xValues[0]) || (isString(xValues[0]) && xValues[0].includes('T') && xValues[0].includes('Z'))) {
            const dates = [...xValues].map(it => new Date(it));
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
        const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';
        const colors = options.colors || defaultLineChartOptions.colors;
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
        const numYTicks = Math.floor(options.yAxis?.ticks ||
            clamp(Math.log10(peakY), Math.max(1, 4 * (size.x / vh)), 100));
        const yStep = Math.max(1, Math.ceil(vh / numYTicks));
        const yTicks = stepRange(vh, yStep);
        const yTickValues = yTicks.map((st) => lerp(0, peakY, st / ((yTicks.length - 1) * yStep)));
        const yTickObjects = yTicks.map((st, i) => {
            return {
                text: formatY(yTickValues[i]),
                value: yTickValues[i],
                pos: VEC2(padding.left, (vh - st) - padding.bottom),
                font: options.yAxis?.font,
                color: options.yAxis?.color,
                size: VEC2(1, 1)
            };
        });
        const yTickMeasures = yTickObjects.map((obj) => measureText(ctx, obj));
        const yTickWidths = yTickMeasures.map((m) => m.width);
        const maxYTickWidth = Math.max(...yTickWidths);
        padding.left += (maxYTickWidth + 8);
        yTickObjects.forEach((obj) => {
            drawText(ctx, { ...obj, pos: obj.pos.add(VEC2(0, -4)) });
            drawLine(ctx, VEC2(obj.pos.x, obj.pos.y), VEC2(obj.pos.x + (size.x - 0.5 * padding.left), obj.pos.y), GRID_COLOR, 2);
        });
        // ===================== X ticks
        const w = remap(instance.resolution.x, 0, instance.resolution.x, padding.left, instance.resolution.x - padding.right); //instance.resolution.x - padding.left;
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
            let y = remap(value, minY, peakY, maxYPos, minYPos);
            const pos = VEC2(x, y);
            //    const dist = pos.distance(instance.mouse);
            //      pos.y -= 100.0 * smoothstep(200, 0.0, dist);
            //const y = (vh - (nv * vh));//minYPos + (nv * (maxYPos - minYPos));//remap(nv, 0, 1, minYPos, maxYPos);
            //const y = remap(value, minY, peakY, Math.min(...yTickObjects.map(it => it.pos.y)), Math.max(...yTickObjects.map(it => it.pos.y)));
            points.push(pos);
        }
        const renderXValue = (x) => {
            const normalize = (x) => {
                if (isNumber(x)) {
                    if (isDate(xValues[0]))
                        return new Date(x);
                    return x;
                }
                return x;
            };
            return formatX(normalize(x));
        };
        const getXAt = (ni) => {
            const xValStart = xValues[0];
            const xValEnd = xValues[Math.max(0, xValues.length - 1)];
            const start = isDate(xValStart) ? xValStart.getTime() : isNumber(xValStart) ? xValStart : 0;
            const end = isDate(xValEnd) ? xValEnd.getTime() : isNumber(xValEnd) ? xValEnd : 0;
            const vl = lerp(start, end, ni);
            const v = isDate(xValStart) ? new Date(Math.ceil(vl)) : vl;
            return v;
        };
        const xTickMeasures = xValues.map(x => measureText(ctx, { text: renderXValue(x), font: options.xAxis?.font, color: options.xAxis?.color, pos: VEC2(0, 0) }));
        const xTickWidths = xTickMeasures.map(it => it.width);
        const maxXTickWidth = Math.max(...xTickWidths);
        //const numXTicks =  options.xAxis?.ticks || Math.min(Math.max(6, Math.floor(w / (xValues.length * (maxXTickWidth)))), xValues.length);
        let xTickObjects = points.map((p, i) => {
            const ni = i / points.length;
            const pos = VEC2(padding.left + p.x, vh + padding.bottom - textMarginBottom);
            const v = getXAt(pos.x / w);
            const size = VEC2(maxXTickWidth * 2, 1);
            let text = formatX(v);
            let args = {
                text,
                value: v,
                pos: pos,
                font: options.xAxis?.font,
                color: options.xAxis?.color,
                size: size
            };
            const m = measureText(ctx, args);
            args.pos.x -= maxXTickWidth;
            return {
                text: text,
                ...args
            };
        });
        const ALLOW_DUPLICATES = false;
        if (!ALLOW_DUPLICATES) {
            //for (let i = 0; i < xTickObjects.length; i+=2) {
            //  const a = xTickObjects[i];
            //  const b = xTickObjects[Math.min(i+1, xTickObjects.length-1)];
            //  
            //  const ma = measureText(ctx, a);
            //  const mb = measureText(ctx, b);
            //  if (a.pos.x + ma.width >= (b.pos.x)) {
            //    xTickObjects[i].text = '...';
            //    xTickObjects[i].color = 'rgba(0, 0, 0, 0.15)';
            //  }
            //  if (b.pos.x + mb.width >= w) {
            //    b.text = '';
            //  }
            //}
            //let fixed: any[] = [];
            //for (let i = 0; i < xTickObjects.length; i++) {
            //  const a = xTickObjects[(xTickObjects.length-1)-i];
            //  if (fixed.includes(a.text)) continue;
            //  fixed.push(a.text);
            //  const dups = xTickObjects.filter(it => it.text === a.text);
            //  if (dups.length > 1) {
            //    a.text = '...';
            //    a.color = 'rgba(0, 0, 0, 0.15)';
            //  }
            //}
            if (isAllSame(xTickObjects.map(it => it.text).filter(it => it.toString().includes('0')))) {
                xTickObjects = uniqueBy(xTickObjects.reverse(), (it) => it.text).reverse();
            }
        }
        //let sameCount = 0;
        //for (let i = xTickObjects.length-1; i >= 0; i--) {
        //  const cur = xTickObjects[i];
        //  const prev = xTickObjects[Math.max(0, i-1)];
        //  if (cur.text === prev.text) sameCount += 1;
        //}
        //if (sameCount > 1) {
        //  const mid = xTickObjects.length/2;
        //  for (let i = 0; i < xTickObjects.length; i++) {
        //    if ((i < (mid) || i > (mid))) {
        //      xTickObjects[i].text = '.';
        //      xTickObjects[i].color = 'rgba(0, 0, 0, 0.15)';
        //    }
        //  }
        //}
        // xTickObjects = uniqueBy(xTickObjects, (it) => it.text);
        //const xTickMeasures = xTickObjects.map(obj => measureText(ctx, obj));
        xTickObjects.forEach((obj) => {
            drawText(ctx, obj);
        });
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
            const ni = clamp(mx / ww, 0, 1);
            //const ni = clamp(
            //  Math.floor((remap(instance.mouse.x, 0, instance.canvas.width,
            //        left, right
            //  ))) / Math.abs(right),
            //  0,
            //  1,
            //); 
            return clamp(Math.ceil((ni * (points.length))), 0, points.length - 1);
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
            return VEC2(x, y);
        };
        const getDataCoord = (pos) => {
            const coord = getCoord(pos);
            const ix = clamp(Math.floor(coord.x / Math.ceil(size.x / xValues.length)), 0, xValues.length - 1);
            const iy = clamp((yValues.length - 1) - Math.floor(coord.y / Math.ceil(size.y / yValues.length)), 0, yValues.length - 1);
            return VEC2(ix, iy);
        };
        const drawStuff = () => {
            const xy = getCoord(instance.mouse);
            drawText(ctx, {
                text: `${Math.floor(xy.x / Math.ceil(w / xValues.length))} | ${xValues.length}`,
                color: 'black',
                pos: VEC2(w / 2, h / 2)
            });
            const drawRealX = () => {
                const numSteps = xValues.length;
                const stepSize = Math.ceil(w / numSteps);
                let x = instance.mouse.x;
                x = Math.floor(x / stepSize) * stepSize;
                drawPoint(ctx, VEC2(x, vh - 30), 'green', 10);
                for (let i = 0; i < numSteps; i++) {
                    drawLine(ctx, VEC2(i * stepSize, vh - 8), VEC2(i * stepSize, vh - 60), 'red', 2);
                }
            };
            const drawRealY = () => {
                const numSteps = yValues.length;
                const stepSize = Math.ceil(h / numSteps);
                let y = instance.mouse.y;
                y = Math.floor(y / stepSize) * stepSize;
                drawPoint(ctx, VEC2(0, y), 'green', 10);
                for (let i = 0; i < numSteps; i++) {
                    drawLine(ctx, VEC2(0, i * stepSize), VEC2(60, i * stepSize), 'blue', 2);
                }
            };
            drawRealX();
            //drawRealY();
            drawPoint(ctx, VEC2(xy.x, xy.y), 'purple', 10);
            //drawTickX();
        };
        //drawStuff();
        const mouseInteraction = () => {
            drawLine(ctx, VEC2(instance.mouse.x, vh), VEC2(instance.mouse.x, 0), GRID_COLOR, 2);
            let mx = (app.mouse.x - rect.x);
            const L = padding.left;
            const R = right;
            mx = mx / (rect.width);
            mx *= (R - 0.5 * L);
            mx -= L;
            const ww = Math.abs((R - L));
            const nx = clamp(mx / ww, 0, 1);
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
            const valueIndex = Math.round(clamp(nx * (yValues.length - 1), 0, yValues.length - 1));
            const xValueIndex = (clamp(Math.floor(nx * (xValues.length - 1)), 0, xValues.length - 1));
            const value = yValues[valueIndex];
            const key1 = xValues[xValueIndex];
            const key = key1;
            const idx = getMousePointIndex();
            const point = points[idx] || VEC2(0, 0); //(curvePoints[idx][1] || curvePoints[idx][0]).clone();
            const getBestPos = (p, fallback = p) => {
                let prev = getPixel(ctx, p);
                let y = vh - (padding.bottom + padding.top) * 2;
                let x = p.x;
                for (; y >= 0; y -= 1) {
                    const pixel = getPixel(ctx, VEC2(x, y)).scale(1.0 / 255.0);
                    if (pixel.mag() <= 0.003 && prev.mag() > 0.003) {
                        return VEC2(x, y);
                    }
                    prev = pixel;
                }
                return fallback;
            };
            const ppx = getBestPos(instance.mouse.run(Math.round), point).lerp(point, 0.1);
            const nextPointPos = VEC2(Math.floor(lerp(ppx.x, instance.mouse.x, 0.9)), clamp(ppx.y, 8, vh - 8));
            const pointPos = prevPointPos.lerp(nextPointPos, clamp(app.deltaTime * 8.0, 0, 1));
            prevPointPos = pointPos;
            drawPoint(ctx, pointPos, options.pointColor || 'red', 8);
            const updateTooltip = () => {
                const tooltipRect = instance.tooltip.el
                    ? instance.tooltip.el.getBoundingClientRect()
                    : { width: 0, height: 0, x: 0, y: 0 };
                const x = lerp(rect.x + (point.x / rx), app.mouse.x, 0.5);
                const y = Math.min((rect.y + (point.y / ry)) - tooltipRect.height, app.mouse.y);
                const nextTooltipPos = VEC2(x, y);
                const pos = tooltipPosPrev.lerp(nextTooltipPos, clamp(app.deltaTime * 8.0, 0, 1));
                tooltipPosPrev = pos;
                instance.tooltip.state.position = pos;
                instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
            };
            //   drawLine(ctx, VEC2(left, vh/2), VEC2(right, vh/2));
            updateTooltip();
            if (options.callback) {
                options.callback(instance, formatX(getXAt(instance.mouse.x / w)), value, valueIndex);
            }
        };
        mouseInteraction();
        return {};
    };
};
