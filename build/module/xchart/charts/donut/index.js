import { VEC2, VEC3 } from "../../utils/vector";
import { defaultDonutOptions } from "./types";
import { clamp, sgt, slt, smin, smoothstep, sum } from "../../utils/etc";
import { ITAU } from "../../constants";
import { hexToUint32, nthByte } from "../../utils/hash";
import { isNumber } from "../../utils/is";
console.log(24);
export const donutChart = (app, instance, data, options = defaultDonutOptions) => {
    const ctx = instance.ctx;
    const center = instance.size.scale(0.5);
    const state = {
        activeSegment: undefined
    };
    const padding = options.padding || defaultDonutOptions.padding || 0;
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
    const total = sum(data.values);
    let currentAngle = -0.5 * Math.PI;
    const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;
    const segments = data.values.map((item, i) => {
        const fraction = item / total;
        const sliceAngle = Math.max(fraction * 2 * Math.PI, ITAU);
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
            pos: VEC2(textPosX, textPosY),
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
    if (hoveredSegment && options.callback && hoveredSegment.value && isNumber(hoveredSegment.value)) {
        options.callback(instance, hoveredSegment.value, hoveredSegment.index);
    }
    segments.forEach(function (p, i) {
        const { sliceAngle, startAngle, endAngle, angle, color } = p;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        const c = hexToUint32(color);
        const B = nthByte(c, 1);
        const G = nthByte(c, 2);
        const R = nthByte(c, 3);
        const rgb = VEC3(R, G, B).scale(1.0 / 255.0);
        const targetRgb = rgb
            .add(VEC3(rgb.luma(), rgb.luma(), rgb.luma()))
            .run((v) => Math.pow(v, 1.0 / 2.2)).lerp(rgb, 0.8);
        const mouse = instance.mouse;
        const mangle = getMouseAngle(mouse, center);
        const mouseDist = mouse.distance(p.pos);
        const s1 = clamp(smoothstep(instance.size.y * 0.5, instance.size.y * 0.01, mouseDist) +
            0.25 * instance.invMouseDistance, 0.0, 1.0);
        let s = smin(sgt(mangle, startAngle, 0.5), slt(mangle, endAngle, 0.5), 0.5); //(mangle >= startAngle && mangle <= endAngle) ? 1.0 : 0.0;//Math.ceil(Math.max(0.0, 1.0 - Math.abs(sliceAngle - Math.sin(TAU*Math.acos(dot))))-0.5);
        if (segments.length <= 1) {
            s = 0;
            const hovered = hoveredSegment && hoveredSegment.index === i;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMveGNoYXJ0L2NoYXJ0cy9kb251dC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBVSxNQUFNLG9CQUFvQixDQUFDO0FBQ3hELE9BQU8sRUFBK0MsbUJBQW1CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0YsT0FBTyxFQUFFLEtBQUssRUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0UsT0FBTyxFQUFFLElBQUksRUFBVyxNQUFNLGlCQUFpQixDQUFDO0FBRWhELE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFaEIsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFvQixDQUN6QyxHQUFTLEVBQ1QsUUFBK0IsRUFDL0IsSUFBZSxFQUNmLFVBQXdCLG1CQUFtQixFQUMxQixFQUFFO0lBQ25CLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFFekIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEMsTUFBTSxLQUFLLEdBQW9CO1FBQzdCLGFBQWEsRUFBRSxTQUFTO0tBQ3pCLENBQUE7SUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUE7SUFDbkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxF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