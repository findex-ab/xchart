import { InternalChartInstance, Visd } from "../../visd";
import { ChartData, ChartOptions, ChartRunFunction } from "../types";
import { LineChartOptions, LineChartState, defaultLineChartOptions } from "./types";
import { VEC2, VEC3, Vector } from "../../utils/vector";
import { chunkify, stepForEach } from "../../utils/array";
import { clamp, lerp, range, smoothstep } from "../../utils/etc";
import { hexToUint32, nthByte } from "../../utils/hash";
import { remToPx } from "../../utils/style";

const line = (ctx: CanvasRenderingContext2D, a: Vector, b: Vector) => {
  ctx.beginPath();
  ctx.quadraticCurveTo(...a.xy, ...b.xy);
  ctx.closePath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
}

type Point = {
  p: Vector;
  index: number;
}

type AxisPoint = {
  p: Vector;
  value: number;
}


export const lineChart: ChartRunFunction = (
  app: Visd,
  instance: InternalChartInstance,
  data: ChartData,
  options: ChartOptions = defaultLineChartOptions,
): LineChartState => {
  const ctx = instance.ctx;


  const fontSizeRem = 0.76;
  const yScale = options.autoFit ? 1.0 : 0.65;
  const offBottom = 0;//100 / yScale;
  const w = instance.size.x;
  const h = instance.size.y * yScale;
  const paddingX = 0;//options.padding || defaultLineChartOptions.padding;
  const paddingY = 0;//paddingX + 12;
  const paddingBot = 0;
  const paddingTop = remToPx(fontSizeRem) * 2;
  
  const colors = options.colors || defaultLineChartOptions.colors;
  //const callback = options.callback || (() => {});

  const peak = Math.max(...data.values.map(Math.abs));
  const dip = Math.min(...data.values.map(Math.abs));
  const xlen = data.values.length;

  const yAxisLineLength = 45;

  const points = data.values.map((v, i) => {
    const nx = i / xlen;
    const ny = v / peak;
    const x = (nx * (w - (yAxisLineLength + paddingX))) + (yAxisLineLength + paddingX);
    const y = offBottom + (((paddingBot + h) - ny * (h - paddingTop)));
    return { p: VEC2(x, y), index: i };
  });

  

  const drawYAxis = () => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    for (let i = 0; i < yAxis.length; i++) {
      const ax = yAxis[i];
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

      ctx.font = `${fontSizeRem}rem sans-serif`;
      ctx.beginPath();
      ctx.fillText(`${ax.value.toFixed(2)}`, ax.p.x, ax.p.y - 4);
      ctx.closePath();
    }
    ctx.restore();
  }


  const linePoints = (() => {
    const first = points[0];
    const result: Array<Array<Point>> = [];
    for (let i = 0; i < points.length-2; i+=1) {
      const a = points[i];
      const b = points[i+1]
      const mouseDist = instance.mouse.distance(b.p);

      const mix = smoothstep(200.0, 0.0, mouseDist);
      const c = a.p.lerp(b.p, 0.5+0.5*mix);
      //const xc = (a.p.x + b.p.x) * 0.5;
      //const yc = (a.p.y + b.p.y) * 0.5;
      result.push([{ p: a.p, index: a.index }, {p: c, index: i+1}]);
    }
    return result;
  })();

  const drawPath = () => {
    ctx.save();
    ctx.beginPath();
    const first = linePoints[0][0];
    const last = linePoints[linePoints.length-1][0];

    const strokeGrad = ctx.createLinearGradient(first.p.x, first.p.y, last.p.x, last.p.y);
    const fillGrad = ctx.createLinearGradient(0, peak, 0, h+offBottom);
    colors.forEach((color, i) => {
      strokeGrad.addColorStop(i / colors.length, color);
      
    });
    const c = hexToUint32(colors[2%colors.length]);
    const B = nthByte(c, 1);
    const G = nthByte(c, 2);
    const R = nthByte(c, 3);
    const rgb = VEC3(R, G,B);
    fillGrad.addColorStop(1, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.25})`)
    fillGrad.addColorStop(0.5, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.75})`)
    fillGrad.addColorStop(0, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${1.0})`)
    ctx.strokeStyle = strokeGrad;
    ctx.fillStyle = fillGrad;
    ctx.lineWidth = 2;

    
    ctx.moveTo(...points[0].p.xy);
    linePoints.forEach(([a, b]) => {
      ctx.quadraticCurveTo(a.p.x, a.p.y, b.p.x, b.p.y);
    })

    
    let i = linePoints.length;
    ctx.quadraticCurveTo(points[i].p.x, points[i].p.y, points[i+1].p.x, points[i+1].p.y);
    ctx.quadraticCurveTo(points[i+1].p.x, points[i+1].p.y, w-(paddingX-yAxisLineLength), (h - 0.5 * paddingY) + offBottom);
    ctx.quadraticCurveTo(w-paddingX, (h - 0.5 * paddingY) + offBottom, yAxisLineLength + paddingX, (h - 0.5 * paddingY) + offBottom);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const pointsToDraw = [[points[0], points[0]], ...linePoints, [points[points.length-1], points[points.length-1]]];

  const drawPoints = () => {
    ctx.save();

    
    pointsToDraw.forEach(([a, b], i) => {

      let p = b.p;

      const mouseDist = instance.mouse.distance(b.p);
      const s = smoothstep(48.0, 0.0, mouseDist);
      const radius = lerp(2.0, 12.0, s);

      ctx.fillStyle = colors[i%colors.length];
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0.0, Math.PI*2.0);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  const drawLabel = (point: Point) => {
    const p = point.p;
      const mouseDist = instance.mouse.distance(p);
      const s = smoothstep(48.0, 0.0, mouseDist);

      const label = data.labels ? data.labels[point.index] : undefined;

      if (label && s > 0) {
        const fontSize = lerp(1, 2, s);
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${s})`;
        ctx.textAlign = 'center';
        ctx.font = `${fontSize}rem sans-serif`;
        ctx.fillText(`${label}`, p.x, p.y);
        ctx.closePath();
        ctx.restore();
      }
  }


  const yAxis = (() =>  {
    const result: AxisPoint[] = [];
    const max = (offBottom+h)-paddingY;
    const step = Math.max(1, (max / 10)-1);
    for (let i = 0; i < max; i+=step) {
      const ni = i / max;
      const y = offBottom + ((((paddingBot + h) - ni * (h - paddingTop))));
      result.push({ p: VEC2(0, y), value: (ni*peak) });
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

  const closestPoint = (() => {
    return [...points].sort((a, b) => {
      const da = a.p.distance(instance.mouse);
      const db = b.p.distance(instance.mouse);
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
}
