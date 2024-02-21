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
    const radius = (Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding) / window.devicePixelRatio;
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