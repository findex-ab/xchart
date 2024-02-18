import { VEC2, VEC3 } from "../../utils/vector";
import { defaultDonutOptions } from "./types";
import { lerp, sgt, slt, sum } from "../../utils/etc";
import { ITAU, PI } from "../../constants";
import { hexToUint32, nthByte } from "../../utils/hash";
export var donutChart = function (app, center, data, options, callback) {
    if (options === void 0) { options = defaultDonutOptions; }
    var ctx = app.ctx;
    var state = {
        activeSegment: undefined
    };
    var padding = options.padding || defaultDonutOptions.padding || 0;
    var colors = data.colors || [
        "#9CA3AF",
        "#1a56db",
        "#7e3af2",
        "#16bdca",
        "#ff8a4c",
    ];
    var thick = options.thick || 1.5;
    var getMouseAngle = function (mouse, center) {
        var delta = mouse.sub(center);
        var angle = Math.atan2(delta.y, delta.x);
        return angle < -0.5 * Math.PI ? angle + 2 * Math.PI : angle;
    };
    var getHoveredSegment = function (segments) {
        var mouseAngle = getMouseAngle(app.mouse, center);
        return segments.find(function (segment) {
            return mouseAngle >= segment.startAngle && mouseAngle <= segment.endAngle;
        });
    };
    var total = sum(data.values);
    var currentAngle = -0.5 * Math.PI;
    var radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;
    var segments = data.values.map(function (item, i) {
        var fraction = item / total;
        var sliceAngle = Math.max(fraction * 2 * Math.PI, ITAU);
        var middleAngle = currentAngle + 0.5 * sliceAngle;
        var angle = currentAngle;
        var textPercentage = ((item / total) * 100).toFixed(1) + "%";
        var textPosX = center.x + radius * 0.82 * Math.cos(middleAngle);
        var textPosY = center.y + radius * 0.82 * Math.sin(middleAngle);
        currentAngle += sliceAngle;
        return {
            value: item,
            sliceAngle: sliceAngle,
            middleAngle: middleAngle,
            textPercentage: textPercentage,
            pos: VEC2(textPosX, textPosY),
            angle: angle,
            startAngle: angle,
            endAngle: angle + sliceAngle,
            index: i,
            fraction: fraction,
            color: colors[i % colors.length],
        };
    });
    var hoveredSegment = getHoveredSegment(segments);
    state.activeSegment = hoveredSegment;
    if (hoveredSegment && callback) {
        callback(hoveredSegment);
    }
    segments.forEach(function (p, i) {
        var sliceAngle = p.sliceAngle, angle = p.angle, color = p.color, startAngle = p.startAngle, endAngle = p.endAngle;
        var hovered = hoveredSegment && hoveredSegment.index === i;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        var c = hexToUint32(color);
        var B = nthByte(c, 1);
        var G = nthByte(c, 2);
        var R = nthByte(c, 3);
        if (hovered) {
            var mouseAngle = getMouseAngle(app.mouse, center);
            //  mouseAngle >= p.startAngle;// && mouseAngle <= p.endAngle
            var f = sgt(mouseAngle, p.startAngle, 0.5) * slt(mouseAngle, p.endAngle, 0.5);
            f = lerp(f, f * 2.0, 0.5 + 0.5 * Math.sin(0.0025 * app.time));
            var g = ctx.createRadialGradient(center.x, center.y, PI, p.pos.x, p.pos.y, radius); //ctx.createConicGradient(0, app.mouse.x, app.mouse.y);
            g.addColorStop(0.0, color);
            g.addColorStop(0.25, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(1, 1, 1), f * 0.5).scale(255).toRGB(2));
            // g.addColorStop(0.5, 'white');
            g.addColorStop(1.0, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(B, G, R).scale(1.0 / 255.0), f * 0.5).scale(255).toRGB(2));
            ctx.fillStyle = g;
        }
        ctx.fill();
        ctx.resetTransform();
    });
    segments.forEach(function (p, i) {
        var sliceAngle = p.sliceAngle, textPercentage = p.textPercentage, pos = p.pos;
        currentAngle += sliceAngle;
        ctx.fillStyle = "black";
        ctx.font = "24px Sans-Serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (hoveredSegment && hoveredSegment.index === i) {
            ctx.fillStyle = "white";
        }
        ctx.fillText(textPercentage, pos.x, pos.y);
    });
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius / thick, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    return state;
};
//# sourceMappingURL=index.js.map