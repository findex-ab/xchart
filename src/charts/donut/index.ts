import { Visd } from "@/visd";
import { VEC2, VEC3, Vector } from "@/utils/vector";
import { DonutChartState, DonutOptions, DonutSegment, defaultDonutOptions } from "./types";
import { lerp, sgt, slt, sum } from "@/utils/etc";
import { ITAU, PI, TAU } from "@/constants";
import { ChartData } from "../types";
import { hexToUint32, nthByte } from "@/utils/hash";


export const donutChart = (
  app: Visd,
  center: Vector,
  data: ChartData,
  options: DonutOptions = defaultDonutOptions,
  callback?: (segment: DonutSegment) => void
): DonutChartState => {
  const ctx = app.ctx;

  const state: DonutChartState = {
    activeSegment: undefined
  }
  
  const padding = options.padding || defaultDonutOptions.padding || 0;
  const colors = data.colors || [
    "#9CA3AF",
    "#1a56db",
    "#7e3af2",
    "#16bdca",
    "#ff8a4c",
  ];
  const thick = options.thick || 1.5;

  const getMouseAngle = (mouse: Vector, center: Vector): number => {
    const delta = mouse.sub(center);
    var angle = Math.atan2(delta.y, delta.x);
    return angle < -0.5 * Math.PI ? angle + 2 * Math.PI : angle;
  };

  const getHoveredSegment = (segments: DonutSegment[]) => {
    const mouseAngle = getMouseAngle(app.mouse, center);
    return segments.find(
      (segment) =>
        mouseAngle >= segment.startAngle && mouseAngle <= segment.endAngle
    );
  };

  const total = sum(data.values);
  let currentAngle = -0.5 * Math.PI;
  const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - padding;

  const segments: DonutSegment[] = data.values.map((item, i) => {
    const fraction = item / total;
    const sliceAngle = Math.max(fraction * 2 * Math.PI, ITAU);
    const middleAngle = currentAngle + 0.5 * sliceAngle;
    const angle = currentAngle;
    const textPercentage = ((item / total) * 100).toFixed(1) + "%";
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
      color: colors[i % colors.length],
    };
  });

  const hoveredSegment = getHoveredSegment(segments);
  state.activeSegment = hoveredSegment;

  if (hoveredSegment && callback) {
    callback(hoveredSegment);
  }

  segments.forEach(function (p, i) {
    const { sliceAngle, angle, color, startAngle, endAngle } = p;

    const hovered = hoveredSegment && hoveredSegment.index === i;

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, angle, angle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = color;
    const c = hexToUint32(color);
    const B = nthByte(c, 1);
    const G = nthByte(c, 2);
    const R = nthByte(c, 3);
    if (hovered) {
      const mouseAngle = getMouseAngle(app.mouse, center);
      //  mouseAngle >= p.startAngle;// && mouseAngle <= p.endAngle

      let f = sgt(mouseAngle, p.startAngle, 0.5) * slt(mouseAngle, p.endAngle, 0.5);
      f = lerp(f, f*2.0, 0.5+0.5*Math.sin(0.0025*app.time));

      const g = ctx.createRadialGradient(center.x, center.y, PI, p.pos.x, p.pos.y, radius);//ctx.createConicGradient(0, app.mouse.x, app.mouse.y);
      g.addColorStop(0.0, color);
      g.addColorStop(0.25, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(1, 1, 1), f*0.5).scale(255).toRGB(2));
     // g.addColorStop(0.5, 'white');
      g.addColorStop(1.0, VEC3(R, G, B).scale(1.0 / 255.0).lerp(VEC3(B, G, R).scale(1.0 / 255.0), f*0.5).scale(255).toRGB(2));
      ctx.fillStyle = g;
    }

    ctx.fill();
    ctx.resetTransform();
  });

  segments.forEach((p, i) => {
    const { sliceAngle, textPercentage, pos } = p;
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
