var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defaultLineChartOptions } from "./types";
import { VEC2, VEC3 } from "../../utils/vector";
import { lerp, smoothstep } from "../../utils/etc";
import { hexToUint32, nthByte } from "../../utils/hash";
import { remToPx } from "../../utils/style";
var line = function (ctx, a, b) {
    ctx.beginPath();
    ctx.quadraticCurveTo.apply(ctx, __spreadArray(__spreadArray([], a.xy, false), b.xy, false));
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.stroke();
};
export var lineChart = function (app, instance, data, options) {
    if (options === void 0) { options = defaultLineChartOptions; }
    var ctx = instance.ctx;
    var fontSizeRem = 0.76;
    var yScale = options.autoFit ? 1.0 : 0.65;
    var offBottom = 0; //100 / yScale;
    var w = instance.size.x;
    var h = instance.size.y * yScale;
    var paddingX = 0; //options.padding || defaultLineChartOptions.padding;
    var paddingY = 0; //paddingX + 12;
    var paddingBot = 0;
    var paddingTop = remToPx(fontSizeRem) * 2;
    var colors = options.colors || defaultLineChartOptions.colors;
    //const callback = options.callback || (() => {});
    var peak = Math.max.apply(Math, data.values.map(Math.abs));
    var dip = Math.min.apply(Math, data.values.map(Math.abs));
    var xlen = data.values.length;
    var yAxisLineLength = 45;
    var points = data.values.map(function (v, i) {
        var nx = i / xlen;
        var ny = v / peak;
        var x = (nx * (w - (yAxisLineLength + paddingX))) + (yAxisLineLength + paddingX);
        var y = offBottom + (((paddingBot + h) - ny * (h - paddingTop)));
        return { p: VEC2(x, y), index: i };
    });
    var drawYAxis = function () {
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        for (var i = 0; i < yAxis.length; i++) {
            var ax = yAxis[i];
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax.p.x, ax.p.y);
            ctx.lineTo(ax.p.x + yAxisLineLength, ax.p.y);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ax.p.x + yAxisLineLength, ax.p.y);
            ctx.lineTo(w, ax.p.y);
            ctx.closePath();
            ctx.stroke();
            ctx.font = "".concat(fontSizeRem, "rem sans-serif");
            ctx.beginPath();
            ctx.fillText("".concat(ax.value.toFixed(2)), ax.p.x, ax.p.y - 4);
            ctx.closePath();
        }
        ctx.restore();
    };
    var linePoints = (function () {
        var first = points[0];
        var result = [];
        for (var i = 0; i < points.length - 2; i += 1) {
            var a = points[i];
            var b = points[i + 1];
            var mouseDist = instance.mouse.distance(b.p);
            var mix = smoothstep(200.0, 0.0, mouseDist);
            var c = a.p.lerp(b.p, 0.5 + 0.5 * mix);
            //const xc = (a.p.x + b.p.x) * 0.5;
            //const yc = (a.p.y + b.p.y) * 0.5;
            result.push([{ p: a.p, index: a.index }, { p: c, index: i + 1 }]);
        }
        return result;
    })();
    var drawPath = function () {
        ctx.save();
        ctx.beginPath();
        var first = linePoints[0][0];
        var last = linePoints[linePoints.length - 1][0];
        var strokeGrad = ctx.createLinearGradient(first.p.x, first.p.y, last.p.x, last.p.y);
        var fillGrad = ctx.createLinearGradient(0, peak, 0, h + offBottom);
        colors.forEach(function (color, i) {
            strokeGrad.addColorStop(i / colors.length, color);
        });
        var c = hexToUint32(colors[2 % colors.length]);
        var B = nthByte(c, 1);
        var G = nthByte(c, 2);
        var R = nthByte(c, 3);
        var rgb = VEC3(R, G, B);
        fillGrad.addColorStop(1, "rgba(".concat(rgb.x, ", ").concat(rgb.y, ", ").concat(rgb.z, ", ").concat(0.25, ")"));
        fillGrad.addColorStop(0.5, "rgba(".concat(rgb.x, ", ").concat(rgb.y, ", ").concat(rgb.z, ", ").concat(0.75, ")"));
        fillGrad.addColorStop(0, "rgba(".concat(rgb.x, ", ").concat(rgb.y, ", ").concat(rgb.z, ", ").concat(1.0, ")"));
        ctx.strokeStyle = strokeGrad;
        ctx.fillStyle = fillGrad;
        ctx.lineWidth = 2;
        ctx.moveTo.apply(ctx, points[0].p.xy);
        linePoints.forEach(function (_a) {
            var a = _a[0], b = _a[1];
            ctx.quadraticCurveTo(a.p.x, a.p.y, b.p.x, b.p.y);
        });
        var i = linePoints.length;
        ctx.quadraticCurveTo(points[i].p.x, points[i].p.y, points[i + 1].p.x, points[i + 1].p.y);
        ctx.quadraticCurveTo(points[i + 1].p.x, points[i + 1].p.y, w - (paddingX - yAxisLineLength), (h - 0.5 * paddingY) + offBottom);
        ctx.quadraticCurveTo(w - paddingX, (h - 0.5 * paddingY) + offBottom, yAxisLineLength + paddingX, (h - 0.5 * paddingY) + offBottom);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };
    var pointsToDraw = __spreadArray(__spreadArray([[points[0], points[0]]], linePoints, true), [[points[points.length - 1], points[points.length - 1]]], false);
    var drawPoints = function () {
        ctx.save();
        pointsToDraw.forEach(function (_a, i) {
            var a = _a[0], b = _a[1];
            var p = b.p;
            var mouseDist = instance.mouse.distance(b.p);
            var s = smoothstep(48.0, 0.0, mouseDist);
            var radius = lerp(2.0, 12.0, s);
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0.0, Math.PI * 2.0);
            ctx.closePath();
            ctx.fill();
        });
        ctx.restore();
    };
    var drawLabel = function (point) {
        var p = point.p;
        var mouseDist = instance.mouse.distance(p);
        var s = smoothstep(48.0, 0.0, mouseDist);
        var label = data.labels ? data.labels[point.index] : undefined;
        if (label && s > 0) {
            var fontSize = lerp(1, 2, s);
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, ".concat(s, ")");
            ctx.textAlign = 'center';
            ctx.font = "".concat(fontSize, "rem sans-serif");
            ctx.fillText("".concat(label), p.x, p.y);
            ctx.closePath();
            ctx.restore();
        }
    };
    var yAxis = (function () {
        var result = [];
        var max = (offBottom + h) - paddingY;
        var step = Math.max(1, (max / 10) - 1);
        for (var i = 0; i < max; i += step) {
            var ni = i / max;
            var y = offBottom + ((((paddingBot + h) - ni * (h - paddingTop))));
            result.push({ p: VEC2(0, y), value: (ni * peak) });
        }
        return result.reverse();
    })();
    drawYAxis();
    ///const yAxis = range(Math.ceil(h/peak)).map((v, i):AxisPoint => {
    ///  const ny = (v / h) * peak;
    ///  const vid = clamp(Math.round(ny*(data.values.length+1)), 0, data.values.length-1);
    ///  const y = (h - ny * (h - paddingY)) - (paddingY / 2);
    ///  return { p: VEC2(0, y), value: [...data.values].sort((a, b) => (a - b))[vid] };
    ///});
    var closestPoint = (function () {
        return __spreadArray([], points, true).sort(function (a, b) {
            var da = a.p.distance(instance.mouse);
            var db = b.p.distance(instance.mouse);
            return da - db;
        })[0];
    })();
    drawPath();
    drawPoints();
    drawLabel(closestPoint);
    if (options.callback) {
        options.callback(instance, data.values[closestPoint.index] || 0, closestPoint.index || 0);
    }
    //ctx.save();
    //ctx.fillStyle = 'red';
    //ctx.beginPath();
    //ctx.arc(instance.mouse.x, instance.mouse.y, 10, 0, Math.PI*2);
    //ctx.closePath();
    //ctx.fill();
    //ctx.restore();
    return {};
};
//# sourceMappingURL=index.js.map