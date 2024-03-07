import { rangeToArray } from '../../types/range';
import { Padding } from '../../types/style';
import { drawLine, drawPoint, drawRect, drawText } from '../../utils/draw';
import {
  clamp,
  rangeFromTo,
  remap,
  smoothstep,
  stepRange,
} from '../../utils/etc';
import { hexToUint32, nthByte } from '../../utils/hash';
import { isNumber } from '../../utils/is';
import { VEC2, VEC3, VEC4, Vector } from '../../utils/vector';
import { Visd } from '../../visd';
import {
  ChartData,
  ChartOptions,
  ChartSetupFunction,
  ChartUpdateFunction,
} from '../types';
import { defaultLineChartOptions } from './types';

const drawCurve2 = (
  ctx: CanvasRenderingContext2D,
  points: Vector[],
  w: number,
  h: number,
  padding: Padding,
  colors: string[] = ['#FF0000', '#00FF00'],
) => {
  colors = colors || ['#FF0000', '#00FF00'];
  if (points.length <= 0) return;
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

    const strokeGrad = ctx.createLinearGradient(
      first.x,
      first.y,
      last.x,
      last.y,
    );
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
  ctx.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y,
  );

  const padY = padding.bottom + padding.top;
  ctx.quadraticCurveTo(
    points[i + 1].x,
    points[i + 1].y,
    w - padding.right,
    h - padY,
  );
  ctx.quadraticCurveTo(w - padding.right, h - padY, padding.left, h - padY);
  //ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const lineChart: ChartSetupFunction = (
  app: Visd,
  data: ChartData,
  options: ChartOptions = defaultLineChartOptions,
): ChartUpdateFunction => {
  return (instance) => {
    const xValues = rangeToArray(options.xAxis?.range || []);
    const yValues = data.values || rangeToArray(options.yAxis?.range || []);
    const ctx = instance.ctx;
    const size = instance.resolution;
   ctx.font = '16px sans-serif';

    // Data with dates
    const items = xValues.map((x, i) => {
      return { date: x, value: yValues[i] };
    });

    const maxValue = Math.max(...items.map((item) => item.value));
    const padding = (ctx.measureText(`${maxValue.toFixed(2)}`).width * (size.x/size.y)) + 4;
    const spaceBetween = (size.x - 2 * padding) / (items.length - 1);
    const graphHeight = size.y - 2 * padding;

    // Function to scale the graph vertically
    function scaleY(value) {
      return size.y - padding - (value / maxValue) * graphHeight;
    }

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, size.y - padding);
    ctx.stroke();

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(padding, size.y - padding);
    ctx.lineTo(size.x - padding, size.y - padding);
    ctx.stroke();

    // Draw Y-axis labels and lines
    const numYAxisLabels = 6;
    for (let i = 0; i <= numYAxisLabels; i++) {
      const yValue = (i / (numYAxisLabels))*maxValue;//(maxValue / numYAxisLabels) * i;
      const yPos = scaleY(yValue);

      // Draw horizontal guide lines
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(size.x - padding, yPos);
      ctx.strokeStyle = '#e0e0e0';
      ctx.stroke();

      // Draw Y-axis label text
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText(yValue.toFixed(2), padding - 10, yPos + 3);
    }

    // Draw the lines for the graph

    let points: Vector[] = items.map((item, i) => {
      return VEC2(padding + i * spaceBetween, scaleY(item.value));
    });

    drawCurve2(
      ctx,
      points,
      size.x,
      size.y,
      { left: padding, right: padding, top: 0, bottom: padding },
      options.colors || ['#ff0000', '#00ff00'],
    );
    //const SMOOTH = true;
    //if (!SMOOTH) {
    //ctx.strokeStyle = "#000";
    //ctx.beginPath();
    //ctx.moveTo(padding, scaleY(items[0].value));
    //items.forEach(function(point, index) {
    //    ctx.lineTo(padding + index * spaceBetween, scaleY(point.value));
    //});
    //  ctx.stroke();
    //} else {

    //ctx.beginPath();
    //ctx.strokeStyle = "#000";
    //plotSmoothLine(items); // Call the function to plot the smooth line
    //ctx.stroke();
    //}

    // Draw points on the graph
    // ctx.fillStyle = "#FF0000";
    // items.forEach(function(point, index) {
    //     ctx.beginPath();
    //     ctx.arc(padding + index * spaceBetween, scaleY(point.value), 5, 0, 2 * Math.PI);
    //     ctx.fill();
    // });

    const labelInterval = Math.max(Math.floor(items.length / 10), 1);

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    items.forEach(function (point, index) {
      if (index % labelInterval === 0) {
        const getText = () => {
          if (isNumber(point.date)) return `${point.date}`;
          const date = new Date(point.date);
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          return formattedDate;
        };
        ctx.fillText(
          getText(),
          padding + index * spaceBetween,
          size.y - padding + 20,
        );
      }
    });
  };
};
