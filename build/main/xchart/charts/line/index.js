"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineChart = void 0;
const types_1 = require("./types");
const vector_1 = require("../../utils/vector");
const etc_1 = require("../../utils/etc");
const hash_1 = require("../../utils/hash");
const style_1 = require("../../utils/style");
const range_1 = require("../../types/range");
const is_1 = require("../../utils/is");
const utils_1 = require("./utils");
const lineChart = (app, data, options = types_1.defaultLineChartOptions) => {
    let tooltipPosition = app.mouse.clone();
    let tooltipPositionPrev = tooltipPosition.clone();
    const fontSize = (0, is_1.isString)(options.fontSize)
        ? options.fontSize
        : (0, is_1.isNumber)(options.fontSize)
            ? (0, style_1.pxToRemStr)(options.fontSize)
            : `0.76rem`;
    const yAxisFont = options.yAxis && options.yAxis.font
        ? options.yAxis.font
        : `${fontSize} sans-serif`;
    const xAxisFont = options.xAxis && options.xAxis.font
        ? options.xAxis.font
        : `${fontSize} sans-serif`;
    return (instance) => {
        const ctx = instance.ctx;
        const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';
        const verticalPadding = 32 + 16;
        //const fontSizeRem = 0.76;
        const w = instance.resolution.x;
        const h = instance.resolution.y;
        const vh = h - verticalPadding;
        const dims = [
            instance.resolution.x,
            instance.resolution.y,
            instance.size.x,
            instance.size.y,
            instance.canvas.width,
            instance.canvas.height,
        ];
        const minDim = Math.min(...dims);
        const maxDim = Math.max(...dims);
        const xAxisItems = [
            ...(options.xAxis ? (0, range_1.rangeToArray)(options.xAxis.range) : []),
        ];
        const colors = options.colors || types_1.defaultLineChartOptions.colors;
        //const callback = options.callback || (() => {});
        const values = [...data.values].map((v) => Math.max(0, v));
        const labels = data.labels ? data.labels : values.map((v) => v.toFixed(3));
        const peak = Math.max(...values);
        const mid = (0, etc_1.median)(values);
        const xlen = values.length;
        const metrics = {
            w: w,
            h: h,
            vw: 0,
            vh: vh,
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: verticalPadding
            },
            peak,
            mid,
            font: ''
        };
        const yAxis = (0, utils_1.computeYAxis)(app, data, values, ctx, options, Object.assign(Object.assign({}, metrics), { font: yAxisFont }));
        const yAxisLineLength = yAxis.maxTextWidth; //maxYAxisLength + yAxisPad;
        const horizontalPadding = 0;
        const vw = w - verticalPadding;
        const points = values.map((v, i) => {
            const nx = i / xlen;
            const ny = v / (peak + (verticalPadding / vh) * peak);
            const x = nx * (vw - yAxisLineLength) + yAxisLineLength;
            const y = Math.max(0, vh - ny * vh); //offBottom + (((paddingBot + h) - ny * (h - paddingTop)));
            return { p: (0, vector_1.VEC2)(x, y), index: i };
        });
        const linePoints = (() => {
            if (points.length <= 0)
                return [];
            const result = [];
            for (let i = 0; i < points.length - 2; i += 1) {
                const a = points[i];
                const b = points[(0, etc_1.clamp)(i + 1, 0, points.length - 1)];
                const mouseDist = instance.mouse.distance(b.p);
                const mix = (0, etc_1.clamp)((0, etc_1.smoothstep)(200.0, 0.0, mouseDist), 0, 1);
                const c = a.p.lerp(b.p, 0.5 + 0.5 * mix);
                //const xc = (a.p.x + b.p.x) * 0.5;
                //const yc = (a.p.y + b.p.y) * 0.5;
                result.push([
                    { p: a.p, index: a.index },
                    { p: c, index: i + 1 },
                ]);
            }
            return result;
        })();
        const pointsToDraw = [
            [points[0], points[0]],
            ...linePoints,
            [points[points.length - 1], points[points.length - 1]],
        ];
        const drawSmoothPath = () => {
            if (linePoints.length <= 0)
                return;
            if (linePoints[0].length <= 0)
                return;
            ctx.save();
            ctx.beginPath();
            const first = linePoints[0][0];
            const last = linePoints[linePoints.length - 1][0];
            const strokeGrad = ctx.createLinearGradient(first.p.x, first.p.y, last.p.x, last.p.y);
            const fillGrad = ctx.createLinearGradient(0, 0, 0, vh);
            colors.forEach((color, i) => {
                strokeGrad.addColorStop(i / colors.length, color);
            });
            const c = (0, hash_1.hexToUint32)(colors[2 % colors.length]);
            const B = (0, hash_1.nthByte)(c, 1);
            const G = (0, hash_1.nthByte)(c, 2);
            const R = (0, hash_1.nthByte)(c, 3);
            const rgb = (0, vector_1.VEC3)(R, G, B);
            fillGrad.addColorStop(1, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.25})`);
            fillGrad.addColorStop(0.5, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.75})`);
            fillGrad.addColorStop(0, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${1.0})`);
            ctx.strokeStyle = strokeGrad;
            ctx.fillStyle = fillGrad;
            ctx.lineWidth = options.thick || 2;
            ctx.moveTo(...points[0].p.xy);
            linePoints.forEach(([a, b]) => {
                ctx.quadraticCurveTo(a.p.x, a.p.y, b.p.x, b.p.y);
            });
            let i = linePoints.length;
            ctx.quadraticCurveTo(points[i].p.x, points[i].p.y, points[i + 1].p.x, points[i + 1].p.y);
            ctx.quadraticCurveTo(points[i + 1].p.x, points[i + 1].p.y, vw, vh);
            ctx.quadraticCurveTo(vw, vh, yAxisLineLength, vh);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
        const drawPath = () => {
            if (points.length <= 0)
                return;
            for (let i = 0; i < points.length; i++) {
                const a = points[i];
                const b = points[(0, etc_1.clamp)(i + 1, 0, points.length - 1)];
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = options.thick || 2;
                ctx.moveTo(a.p.x, a.p.y);
                ctx.lineTo(b.p.x, b.p.y);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        };
        const drawPoints = (pointsToDraw) => {
            ctx.save();
            pointsToDraw.forEach(([a, b], i) => {
                let p = b.p;
                const mouseDist = instance.mouse.distance(b.p);
                let radius = 4.0;
                const s = (0, etc_1.smoothstep)(options.dynamicSizePoints ? 48.0 : radius / 2, radius / 8, mouseDist);
                if (options.dynamicSizePoints) {
                    radius = (0, etc_1.lerp)(2.0, 12.0, s);
                }
                ctx.globalAlpha = options.drawOnlyClosestPoint
                    ? 1
                    : (0, etc_1.smoothstep)((1.0 / (minDim / maxDim)) * 50, 0.0, mouseDist);
                ctx.fillStyle = options.pointColor || colors[i % colors.length];
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0.0, Math.PI * 2.0);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;
            });
            ctx.restore();
        };
        const getMousePointIndex = () => {
            const ni = (Math.floor(instance.mouse.x) - yAxisLineLength) /
                (vw - yAxisLineLength);
            return (0, etc_1.clamp)(Math.round(ni * (points.length - 1)), 0, points.length - 1);
        };
        const getMousePoint = () => {
            const mousex = Math.floor(instance.mouse.x);
            const index = getMousePointIndex();
            //if (!linePoints[index] || linePoints[index].length <= 1)
            //  return [{ p: VEC2(0, 0), index:0 }, { p: VEC2(0, 0), index:0 }];
            // const y = Math.abs(linePoints[index][1].p.y);
            // const x = lerp(
            //   lerp(linePoints[index][0].p.x, linePoints[index][1].p.x, 0.5),
            //   mousex,
            //   0.5,
            // );
            return [points[index], points[index]];
        };
        const getMousePointInverse = () => {
            const rect = instance.canvas.getBoundingClientRect();
            const p = getMousePoint()[0].p;
            const inv = p.add((0, vector_1.VEC2)(rect.x, rect.y));
            inv.x = app.mouse.x;
            inv.y = Math.min(inv.y, app.mouse.y);
            return inv;
        };
        const drawClosestPoint = () => {
            if (linePoints.length <= 1)
                return;
            ctx.save();
            let radius = 6.0;
            const p = getMousePoint()[0];
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = options.pointColor || colors[0] || 'black';
            ctx.beginPath();
            ctx.arc(p.p.x, p.p.y, radius, 0.0, Math.PI * 2.0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1;
        };
        const drawLabel = (point) => {
            const p = point.p;
            const mouseDist = instance.mouse.distance(p);
            const s = (0, etc_1.smoothstep)((1.0 / (minDim / maxDim)) * 50, 0.0, mouseDist);
            const label = labels
                ? labels[(0, etc_1.clamp)(point.index, 0, labels.length)]
                : undefined;
            if (label && s > 0) {
                const fontSize = (0, etc_1.lerp)(1, 2, s);
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = `rgba(0, 0, 0, ${s})`;
                ctx.textAlign = 'center';
                ctx.font = `${fontSize}rem sans-serif`;
                ctx.fillText(`${label}`, p.x, p.y);
                ctx.closePath();
                ctx.restore();
            }
        };
        const xAxis = (0, utils_1.computeXAxis)(app, data, ctx, options, Object.assign(Object.assign({}, metrics), { vw: w - yAxis.maxTextWidth, padding: Object.assign(Object.assign({}, metrics.padding), { left: yAxis.maxTextWidth, bottom: 24 }) }));
        const closestPoint = (() => {
            return [...points].sort((a, b) => {
                const da = a.p.distance(instance.mouse);
                const db = b.p.distance(instance.mouse);
                return da - db;
            })[0];
        })();
        const draw = () => {
            const drawYAxis = () => {
                ctx.save();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'black';
                for (let i = 0; i < yAxis.points.length; i++) {
                    const ax = yAxis.points[i];
                    ctx.strokeStyle = GRID_COLOR;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    const x = ax.p.x - horizontalPadding;
                    ctx.moveTo(x, ax.p.y);
                    ctx.lineTo(x + yAxisLineLength, ax.p.y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x + yAxisLineLength, ax.p.y);
                    ctx.lineTo(vw, ax.p.y);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fillStyle =
                        options.yAxis && options.yAxis.color
                            ? options.yAxis.color
                            : 'black';
                    ctx.font = yAxisFont;
                    ctx.beginPath();
                    const text = options.yAxis && options.yAxis.format
                        ? options.yAxis.format(ax.value)
                        : `${ax.value.toFixed(2)}`;
                    ctx.fillText(text, x - yAxisLineLength / 2, ax.p.y - 4);
                    ctx.closePath();
                }
                ctx.restore();
            };
            const drawXAxis = (rotate = false) => {
                ctx.save();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'black';
                for (let i = 0; i < xAxis.points.length; i++) {
                    //if (!rotate && i % 2 != 0) continue;
                    const ax = xAxis.points[i];
                    const text = ax.label || '';
                    ctx.font = xAxisFont;
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                    ctx.lineWidth = 1;
                    const x = ax.p.x;
                    const y = ax.p.y + (rotate ? 0 : 16);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + yAxisLineLength);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fillStyle =
                        options.yAxis && options.yAxis.color
                            ? options.yAxis.color
                            : 'black';
                    if (rotate) {
                        ctx.beginPath();
                        ctx.translate(yAxisLineLength / 2 + ax.textWidth / 2 + 2 * horizontalPadding, 0);
                        ctx.translate(x - ax.textWidth, y);
                        ctx.rotate((Math.PI / 180.0) * 30);
                        ctx.fillText(text, 0, 0);
                        ctx.closePath();
                        ctx.resetTransform();
                    }
                    else {
                        ctx.beginPath();
                        ctx.fillText(text, x, y);
                        ctx.closePath();
                    }
                }
                ctx.restore();
            };
            const drawCursor = () => {
                const mouse = instance.mouse;
                ctx.save();
                ctx.strokeStyle = GRID_COLOR;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(mouse.x, verticalPadding);
                ctx.lineTo(mouse.x, vh);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            };
            drawYAxis();
            drawXAxis();
            if (options.smoothPath) {
                drawSmoothPath();
            }
            else {
                drawPath();
            }
            if (options.drawPoints) {
                if (options.drawOnlyClosestPoint) {
                    drawClosestPoint();
                }
                else {
                    drawPoints(pointsToDraw);
                }
            }
            if (closestPoint && options.drawLabels) {
                drawLabel(closestPoint);
            }
            drawCursor();
        };
        const update = () => {
            const updateTooltip = (instance) => {
                const rect = instance.canvas.getBoundingClientRect();
                const tooltipRect = instance.tooltip.el
                    ? instance.tooltip.el.getBoundingClientRect()
                    : { width: 0, height: 0, x: 0, y: 0 };
                if (options.drawOnlyClosestPoint) {
                    const p = getMousePointInverse();
                    p.y -= tooltipRect.height;
                    const pos = tooltipPositionPrev.lerp(p, (0, etc_1.clamp)(app.deltaTime * 8.0, 0, 1));
                    tooltipPositionPrev = pos;
                    instance.tooltip.state.position = pos;
                }
                else {
                    instance.tooltip.state.position = app.mouse.clone();
                    instance.tooltip.state.position.y += tooltipRect.height * 1.5;
                }
                instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
            };
            updateTooltip(instance);
            if (options.callback) {
                const pointIndex = getMousePointIndex();
                const mousePoint = getMousePoint()[0];
                const index = (0, etc_1.clamp)(mousePoint.index, 0, values.length);
                //const index =  clamp(linePoints[pointIndex].length > 0 ? linePoints[pointIndex][0].index : 0, 0, values.length-1);
                const value = values[index];
                const xIndex = (0, etc_1.clamp)(Math.ceil((index / values.length) * (xAxisItems.length - 1)), 0, xAxisItems.length - 1);
                //        if (closestPoint) {
                //          value = lerp(value, values[clamp(closestPoint.index, 0, values.length-1)], 0.5);
                //        }
                //        
                options.callback(instance, xAxisItems[(0, etc_1.clamp)(xIndex, 0, xAxisItems.length - 1)], value, index);
            }
        };
        update();
        draw();
    };
};
exports.lineChart = lineChart;
