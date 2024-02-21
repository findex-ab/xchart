"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donutChart = void 0;
const vector_1 = require("../../utils/vector");
const types_1 = require("./types");
const etc_1 = require("../../utils/etc");
const constants_1 = require("../../constants");
const hash_1 = require("../../utils/hash");
const is_1 = require("../../utils/is");
console.log(24);
const donutChart = (app, instance, data, options = types_1.defaultDonutOptions) => {
    const ctx = instance.ctx;
    const center = instance.size.scale(0.5);
    const state = {
        activeSegment: undefined
    };
    const padding = options.padding || types_1.defaultDonutOptions.padding || 0;
    const colors = data.colors || ['#9CA3AF', '#1a56db', '#7e3af2', '#16bdca', '#ff8a4c'];
    const thick = (options.thick || 1.5) * 0.0; //window.devicePixelRatio;
    const getMouseAngle = (mouse, center) => {
        const delta = mouse.sub(center);
        const angle = Math.atan2(delta.y, delta.x);
        return angle < -0.5 * Math.PI ? angle + 2 * Math.PI : angle;
    };
    alert(93);
    const getExactSegment = (segments) => {
        const mouseAngle = getMouseAngle(instance.mouse, center);
        return segments.find((segment) => mouseAngle >= segment.startAngle && mouseAngle <= segment.endAngle);
    };
    const getSegmentDistances = (seg) => {
        const mouseAngle = getMouseAngle(instance.mouse, center);
        const dist = seg.pos.distance(instance.mouse);
        const a = mouseAngle - seg.startAngle;
        const b = seg.endAngle - mouseAngle;
        return { mouseAngle, dist, a, b };
    };
    const getClosestSegment = (segments) => {
        const mouseAngle = getMouseAngle(instance.mouse, center);
        let closest = segments[0];
        let minDist = 99999999.0;
        for (const seg of segments) {
            const a = mouseAngle - seg.startAngle;
            const b = seg.endAngle - mouseAngle;
            const dist = seg.pos.distance(instance.mouse);
            if (dist < minDist &&
                ((mouseAngle >= seg.startAngle && mouseAngle <= seg.endAngle) ||
                    dist < 2.0 * (padding + seg.fraction))) {
                minDist = dist;
                closest = seg;
            }
        }
        return closest;
    };
    const getHoveredSegment = (segments) => {
        if (instance.mouse.distance(center) > instance.size.y * 1.5)
            return;
        if (segments.length === 1)
            return segments[0];
        if (segments.length <= 2)
            return getClosestSegment(segments);
        return getExactSegment(segments);
    };
    const total = (0, etc_1.sum)(data.values);
    let currentAngle = -0.5 * Math.PI;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;
    const segments = data.values.map((item, i) => {
        const fraction = item / total;
        const sliceAngle = Math.max(fraction * 2 * Math.PI, constants_1.ITAU);
        const middleAngle = currentAngle + 0.5 * sliceAngle;
        const angle = currentAngle;
        const textPercentage = ((item / total) * 100).toFixed(1) + '%';
        const textPosX = center.x + radius * 0.82 * Math.cos(middleAngle);
        const textPosY = center.y + radius * 0.82 * Math.sin(middleAngle);
        currentAngle += sliceAngle;
        return {
            value: item,
            sliceAngle,
            middleAngle,
            textPercentage,
            pos: (0, vector_1.VEC2)(textPosX, textPosY),
            angle,
            startAngle: angle,
            endAngle: angle + sliceAngle,
            index: i,
            fraction,
            color: colors[i % colors.length]
        };
    });
    const hoveredSegment = getHoveredSegment(segments);
    state.activeSegment = hoveredSegment;
    if (hoveredSegment && options.callback && hoveredSegment.value && (0, is_1.isNumber)(hoveredSegment.value)) {
        options.callback(instance, hoveredSegment.value, hoveredSegment.index);
    }
    segments.forEach(function (p, i) {
        const { sliceAngle, startAngle, endAngle, angle, color } = p;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        const c = (0, hash_1.hexToUint32)(color);
        const B = (0, hash_1.nthByte)(c, 1);
        const G = (0, hash_1.nthByte)(c, 2);
        const R = (0, hash_1.nthByte)(c, 3);
        const rgb = (0, vector_1.VEC3)(R, G, B).scale(1.0 / 255.0);
        const targetRgb = rgb
            .add((0, vector_1.VEC3)(rgb.luma(), rgb.luma(), rgb.luma()))
            .run((v) => Math.pow(v, 1.0 / 2.2)).lerp(rgb, 0.8);
        const mouse = instance.mouse;
        const mangle = getMouseAngle(mouse, center);
        const mouseDist = mouse.distance(p.pos);
        const s1 = (0, etc_1.clamp)((0, etc_1.smoothstep)(instance.size.y * 0.5, instance.size.y * 0.01, mouseDist) +
            0.25 * instance.invMouseDistance, 0.0, 1.0);
        let s = (0, etc_1.smin)((0, etc_1.sgt)(mangle, startAngle, 0.5), (0, etc_1.slt)(mangle, endAngle, 0.5), 0.5); //(mangle >= startAngle && mangle <= endAngle) ? 1.0 : 0.0;//Math.ceil(Math.max(0.0, 1.0 - Math.abs(sliceAngle - Math.sin(TAU*Math.acos(dot))))-0.5);
        if (segments.length <= 1) {
            s = 0;
            const hovered = hoveredSegment && hoveredSegment.index === i;
            if (hovered && instance.mouse.distance(center) < instance.size.x * 0.5) {
                s = 1.0;
            }
        }
        else if (segments.length <= 2 && p.fraction < (constants_1.ITAU * 0.5)) {
            s = (0, etc_1.clamp)(s + ((2.0 * (padding + p.fraction)) - mouseDist), 0.0, 1.0);
        }
        s *= (0, etc_1.smoothstep)(instance.size.y * 0.75, instance.size.y * 0.15, mouse.distance(center) * 0.95);
        ctx.fillStyle = rgb.lerp(targetRgb, s).scale(255.0).toRGB(3); //lerp(1.0, 1.3, s)
        ctx.fill();
    });
    if (options.drawLabels) {
        segments.forEach((p, i) => {
            const { sliceAngle, textPercentage, pos } = p;
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
exports.donutChart = donutChart;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NoYXJ0cy9kb251dC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBd0Q7QUFDeEQsbUNBQTJGO0FBQzNGLHlDQUErRTtBQUMvRSwrQ0FBZ0Q7QUFFaEQsMkNBQXdEO0FBQ3hELHVDQUEwQztBQUcxQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRVQsTUFBTSxVQUFVLEdBQW9CLENBQ3pDLEdBQVMsRUFDVCxRQUErQixFQUMvQixJQUFlLEVBQ2YsVUFBd0IsMkJBQW1CLEVBQzFCLEVBQUU7SUFDbkIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUV6QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QyxNQUFNLEtBQUssR0FBb0I7UUFDN0IsYUFBYSxFQUFFLFNBQVM7S0FDekIsQ0FBQTtJQUVELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksMkJBQW1CLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTtJQUNuRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ3JGLE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQSwwQkFBMEI7SUFFckUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFVLEVBQUU7UUFDOUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFD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