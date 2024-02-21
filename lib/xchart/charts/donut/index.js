import { VEC2, VEC3 } from "../../utils/vector";
import { defaultDonutOptions } from "./types";
import { clamp, sgt, slt, smin, smoothstep, sum } from "../../utils/etc";
import { ITAU } from "../../constants";
import { hexToUint32, nthByte } from "../../utils/hash";
import { isNumber } from "../../utils/is";
console.log(24);
export var donutChart = function (app, instance, data, options) {
    if (options === void 0) { options = defaultDonutOptions; }
    var ctx = instance.ctx;
    var center = instance.size.scale(0.5);
    var state = {
        activeSegment: undefined
    };
    var padding = options.padding || defaultDonutOptions.padding || 0;
    var colors = data.colors || ['#9CA3AF', '#1a56db', '#7e3af2', '#16bdca', '#ff8a4c'];
    var thick = (options.thick || 1.5) * 0.0; //window.devicePixelRatio;
    var getMouseAngle = function (mouse, center) {
        var delta = mouse.sub(center);
        var angle = Math.atan2(delta.y, delta.x);
        return angle < -0.5 * Math.PI ? angle + 2 * Math.PI : angle;
    };
    alert(93);
    var getExactSegment = function (segments) {
        var mouseAngle = getMouseAngle(instance.mouse, center);
        return segments.find(function (segment) { return mouseAngle >= segment.startAngle && mouseAngle <= segment.endAngle; });
    };
    var getSegmentDistances = function (seg) {
        var mouseAngle = getMouseAngle(instance.mouse, center);
        var dist = seg.pos.distance(instance.mouse);
        var a = mouseAngle - seg.startAngle;
        var b = seg.endAngle - mouseAngle;
        return { mouseAngle: mouseAngle, dist: dist, a: a, b: b };
    };
    var getClosestSegment = function (segments) {
        var mouseAngle = getMouseAngle(instance.mouse, center);
        var closest = segments[0];
        var minDist = 99999999.0;
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var seg = segments_1[_i];
            var a = mouseAngle - seg.startAngle;
            var b = seg.endAngle - mouseAngle;
            var dist = seg.pos.distance(instance.mouse);
            if (dist < minDist &&
                ((mouseAngle >= seg.startAngle && mouseAngle <= seg.endAngle) ||
                    dist < 2.0 * (padding + seg.fraction))) {
                minDist = dist;
                closest = seg;
            }
        }
        return closest;
    };
    var getHoveredSegment = function (segments) {
        if (instance.mouse.distance(center) > instance.size.y * 1.5)
            return;
        if (segments.length === 1)
            return segments[0];
        if (segments.length <= 2)
            return getClosestSegment(segments);
        return getExactSegment(segments);
    };
    var total = sum(data.values);
    var currentAngle = -0.5 * Math.PI;
    var radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;
    var segments = data.values.map(function (item, i) {
        var fraction = item / total;
        var sliceAngle = Math.max(fraction * 2 * Math.PI, ITAU);
        var middleAngle = currentAngle + 0.5 * sliceAngle;
        var angle = currentAngle;
        var textPercentage = ((item / total) * 100).toFixed(1) + '%';
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
            color: colors[i % colors.length]
        };
    });
    var hoveredSegment = getHoveredSegment(segments);
    state.activeSegment = hoveredSegment;
    if (hoveredSegment && options.callback && hoveredSegment.value && isNumber(hoveredSegment.value)) {
        options.callback(instance, hoveredSegment.value, hoveredSegment.index);
    }
    segments.forEach(function (p, i) {
        var sliceAngle = p.sliceAngle, startAngle = p.startAngle, endAngle = p.endAngle, angle = p.angle, color = p.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        var c = hexToUint32(color);
        var B = nthByte(c, 1);
        var G = nthByte(c, 2);
        var R = nthByte(c, 3);
        var rgb = VEC3(R, G, B).scale(1.0 / 255.0);
        var targetRgb = rgb
            .add(VEC3(rgb.luma(), rgb.luma(), rgb.luma()))
            .run(function (v) { return Math.pow(v, 1.0 / 2.2); }).lerp(rgb, 0.8);
        var mouse = instance.mouse;
        var mangle = getMouseAngle(mouse, center);
        var mouseDist = mouse.distance(p.pos);
        var s1 = clamp(smoothstep(instance.size.y * 0.5, instance.size.y * 0.01, mouseDist) +
            0.25 * instance.invMouseDistance, 0.0, 1.0);
        var s = smin(sgt(mangle, startAngle, 0.5), slt(mangle, endAngle, 0.5), 0.5); //(mangle >= startAngle && mangle <= endAngle) ? 1.0 : 0.0;//Math.ceil(Math.max(0.0, 1.0 - Math.abs(sliceAngle - Math.sin(TAU*Math.acos(dot))))-0.5);
        if (segments.length <= 1) {
            s = 0;
            var hovered = hoveredSegment && hoveredSegment.index === i;
            if (hovered && instance.mouse.distance(center) < instance.size.x * 0.5) {
                s = 1.0;
            }
        }
        else if (segments.length <= 2 && p.fraction < (ITAU * 0.5)) {
            s = clamp(s + ((2.0 * (padding + p.fraction)) - mouseDist), 0.0, 1.0);
        }
        s *= smoothstep(instance.size.y * 0.75, instance.size.y * 0.15, mouse.distance(center) * 0.95);
        ctx.fillStyle = rgb.lerp(targetRgb, s).scale(255.0).toRGB(3); //lerp(1.0, 1.3, s)
        ctx.fill();
    });
    if (options.drawLabels) {
        segments.forEach(function (p, i) {
            var sliceAngle = p.sliceAngle, textPercentage = p.textPercentage, pos = p.pos;
            currentAngle += sliceAngle;
            ctx.fillStyle = 'black';
            ctx.font = 'inherit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (hoveredSegment && hoveredSegment.index === i) {
                ctx.fillStyle = 'white';
            }
            ctx.fillText(textPercentage, pos.x, pos.y);
        });
    }
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius / thick, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    //ctx.save();
    //ctx.fillStyle = 'black';
    //ctx.beginPath();
    //ctx.arc(center.x, center.y, 10, 0, Math.PI*2);
    //ctx.closePath();
    //ctx.fill();
    //ctx.restore();
    //ctx.save();
    //ctx.fillStyle = 'red';
    //ctx.beginPath();
    //ctx.arc(instance.mouse.x, instance.mouse.y, 10, 0, Math.PI*2);
    //ctx.closePath();
    //ctx.fill();
    //ctx.restore();
    return state;
};
//export const donutChart__backup = (
//  app: Visd,
//  center: Vector,
//  data: ChartData,
//  options: DonutOptions = defaultDonutOptions,
//  callback?: (segment: DonutSegment) => void
//): DonutChartState => {
//  const ctx = app.ctx;
//
//  const state: DonutChartState = {
//    activeSegment: undefined
//  }
//  
//  const padding = options.padding || defaultDonutOptions.padding || 0;
//  const colors = data.colors || [
//    "#9CA3AF",
//    "#1a56db",
//    "#7e3af2",
//    "#16bdca",
//    "#ff8a4c",
//  ];
//  const thick = options.thick || 1.5;
//
//  const getMouseAngle = (mouse: Vector, center: Vector): number => {
//    const delta = mouse.sub(center);
//    var angle = Math.atan2(delta.y, delta.x);
//    return angle < -0.5 * Math.PI ? angle + 2 * Math.PI : angle;
//  };
//
//  const getHoveredSegment = (segments: DonutSegment[]) => {
//    const mouseAngle = getMouseAngle(instance.mouse, center);
//    return segments.find(
//      (segment) =>
//        mouseAngle >= segment.startAngle && mouseAngle <= segment.endAngle
//    );
//  };
//
//  const total = sum(data.values);
//  let currentAngle = -0.5 * Math.PI;
//  const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;
//
//  const segments: DonutSegment[] = data.values.map((item, i) => {
//    const fraction = item / total;
//    const sliceAngle = Math.max(fraction * 2 * Math.PI, ITAU);
//    const middleAngle = currentAngle + 0.5 * sliceAngle;
//    const angle = currentAngle;
//    const textPercentage = ((item / total) * 100).toFixed(1) + "%";
//    const textPosX = center.x + radius * 0.82 * Math.cos(middleAngle);
//    const textPosY = center.y + radius * 0.82 * Math.sin(middleAngle);
//
//    currentAngle += sliceAngle;
//
//    return {
//      value: item,
//      sliceAngle,
//      middleAngle,
//      textPercentage,
//      pos: VEC2(textPosX, textPosY),
//      angle,
//      startAngle: angle,
//      endAngle: angle + sliceAngle,
//      index: i,
//      fraction,
//      color: colors[i % colors.length],
//    };
//  });
//
//  const hoveredSegment = getHoveredSegment(segments);
//  state.activeSegment = hoveredSegment;
//
//  if (hoveredSegment && callback) {
//    callback(hoveredSegment);
//  }
//
//  segments.forEach(function (p, i) {
//    const { sliceAngle, angle, color, startAngle, endAngle } = p;
//
//    const hovered = hoveredSegment && hoveredSegment.index === i;
//
//    ctx.beginPath();
//    ctx.moveTo(center.x, center.y);
//    ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
//    ctx.closePath();
//
//    ctx.fillStyle = color;
//    const c = hexToUint32(color);
//    const B = nthByte(c, 1);
//    const G = nthByte(c, 2);
//    const R = nthByte(c, 3);
//    if (hovered) {
//      const mouseAngle = getMouseAngle(instance.mouse, center);
//      //  mouseAngle >= p.startAngle;// && mouseAngle <= p.endAngle
//
//      let f = sgt(mouseAngle, p.startAngle, 0.5) * slt(mouseAngle, p.endAngle, 0.5);
//      f = lerp(f, f*2.0, 0.5+0.5*Math.sin(0.0025*app.time));
//
//      const g = ctx.createRadialGradient(center.x, center.y, PI, p.pos.x, p.pos.y, radius);//ctx.createConicGradient(0, instance.mouse.x, instance.mouse.y);
//      g.addColorStop(0.0, color);
//      g.addColorStop(0.25, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(1, 1, 1), f*0.5).scale(255).toRGB(2));
//     // g.addColorStop(0.5, 'white');
//      g.addColorStop(1.0, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(B, G, R).scale(1.0 / 255.0), f*0.5).scale(255).toRGB(2));
//      ctx.fillStyle = g;
//    }
//
//    ctx.fill();
//    ctx.resetTransform();
//  });
//
//  segments.forEach((p, i) => {
//    const { sliceAngle, textPercentage, pos } = p;
//    currentAngle += sliceAngle;
//    ctx.fillStyle = "black";
//    ctx.font = "24px Sans-Serif";
//    ctx.textAlign = "center";
//    ctx.textBaseline = "middle";
//
//    if (hoveredSegment && hoveredSegment.index === i) {
//      ctx.fillStyle = "white";
//    }
//    ctx.fillText(textPercentage, pos.x, pos.y);
//  });
//
//  ctx.beginPath();
//  ctx.arc(center.x, center.y, radius / thick, 0, 2 * Math.PI);
//  ctx.fillStyle = "white";
//  ctx.fill();
//
//  return state;
//};
//# sourceMappingURL=index.js.map