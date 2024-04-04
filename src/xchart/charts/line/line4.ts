import { TAU } from '../../constants';
import { unique } from '../../utils/array';
import { clamp, fract, lerp, remap, smoothstep } from '../../utils/etc';
import { VEC2, Vector } from '../../utils/vector';
import { Visd } from '../../visd';
import {
  ChartData,
  ChartOptions,
  ChartSetupFunction,
  ChartUpdateFunction,
} from '../types';
import { defaultLineChartOptions } from './types';

const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';
const CURSOR_RADIUS = 8;

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  point: Vector,
  color: string = 'red',
  radius: number = 10,
) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const lineChart4: ChartSetupFunction = (
  app: Visd,
  data: ChartData,
  options: ChartOptions = defaultLineChartOptions,
): ChartUpdateFunction => {
  let prevTooltipPos = app.mouse;

  return (instance) => {
    const canvas = instance.canvas;
    const ctx = instance.ctx;
    const rect = instance.canvas.getBoundingClientRect();
    const padding = 50; // Adjust padding for axis labels
    const paddingLeft = 64;
    const rx = instance.canvas.width / rect.width;
    const ry = instance.canvas.height / rect.height;
    const plotWidth = canvas.width - ((padding * 2) + paddingLeft);
    const plotHeight = canvas.height - padding * 2;

    // Extract values for easier processing
    const values = data.values || []; //data.map((item) => item.value);
    const dates = (data.dates || []).map((it) => options.xAxis?.format ? options.xAxis.format(it) : it.toLocaleDateString()); //data.map((item) => item.date.toLocaleDateString());
    const uniqueDates = unique(dates);
    if (values.length <= 0 || dates.length <= 0) return;

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue;

    ctx.strokeStyle = GRID_COLOR;
    ctx.beginPath();
    ctx.moveTo(padding + paddingLeft, padding);
    ctx.lineTo(padding + paddingLeft, canvas.height - padding);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = GRID_COLOR;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.closePath();
    ctx.stroke();

    // y-axis
    const yAxisLabelCount = options.yAxis?.ticks || 5;
    const yAxisInterval = valueRange / (yAxisLabelCount - 1);
    for (let i = 0; i < yAxisLabelCount; i++) {
      const label = (minValue + yAxisInterval * i).toFixed(2);
      const y =
        padding +
        (plotHeight / (yAxisLabelCount - 1)) * (yAxisLabelCount - i - 1);

      ctx.fillStyle = options.xAxis?.color || 'black';
      ctx.font = options?.xAxis?.font || '';
      ctx.fillText(label, 0, y - 4);

      // grid lines
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.closePath();
      ctx.strokeStyle = '#e0e0e0'; // Light grey for grid lines
      ctx.stroke();
      ctx.strokeStyle = '#000'; // Reset to black for other drawings
    }

    // X-axis labels
    const xAxisLabelCount = Math.min(uniqueDates.length, options.xAxis?.ticks || 5); // Limit the number of labels to avoid clutter
    for (let i = 0; i < xAxisLabelCount; i++) {
      const labelIndex = clamp(Math.floor(
        ((uniqueDates.length - 1) / (xAxisLabelCount - 1)) * i,
      ), 0, uniqueDates.length-1);

      const xshift = lerp((i / xAxisLabelCount) * uniqueDates.length, labelIndex, 0.5);
      const label = uniqueDates[labelIndex];
      const x = padding + paddingLeft + xshift * (plotWidth / (uniqueDates.length - 1));

      ctx.fillStyle = options.yAxis?.color || 'black';
      ctx.font = options?.yAxis?.font || '';
      ctx.fillText(label, x - 20, canvas.height - 5); // Adjust label positioning as needed
    }

    const computePoints = (): Vector[] => {
      let points: Vector[] = [];
      points.push(VEC2(padding + paddingLeft, canvas.height - padding));

      values.forEach((value, index) => {
        const x = paddingLeft + padding + index * (plotWidth / (values.length - 1));
        const y =
          padding +
          (plotHeight - ((value - minValue) / valueRange) * plotHeight);
        points.push(VEC2(x, y));
      });

      points.push(VEC2(padding + paddingLeft + plotWidth, canvas.height - padding));

      return points;
    };

    const points = computePoints();

    ctx.beginPath();
    ctx.moveTo(...points[0].xy); // Start at the first point on the X-axis
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(...p.xy);
    }
    ctx.closePath(); // Close the path to connect back to the start point

    const fillGrad = ctx.createLinearGradient(0, 0, 0, plotHeight * 2);
    const stops = options?.fillGradient || [
      { stop: 0, color: 'rgba(255, 0, 0, 0)' },
      { stop: 1, color: 'rgba(255, 0, 0, 1)' },
    ];
    stops.forEach((s) => fillGrad.addColorStop(s.stop, s.color));
    // Fill the area under the line
    ctx.fillStyle = fillGrad; //'rgba(135, 206, 235, 0.5)';
    ctx.fill();
    //ctx.stroke();

    const getIndexAtX = (x: number, xMin: number) => {
      const remapped = x - xMin - (padding + paddingLeft); // Adjust for padding
      const index = Math.round((remapped / plotWidth) * (values.length - 1));
      return clamp(index, 0, values.length - 1);
    };

    const getPointIndexAtX = (x: number, xMin: number) => {
      const remapped = x - xMin - (padding + paddingLeft); // Adjust for padding
      const index = Math.round((remapped / plotWidth) * (points.length - 1));
      return clamp(index, 1, Math.max(points.length - 2, 1));
    };

    const getPointAtX = (x: number, xMin: number) => {
      return points[getPointIndexAtX(x, xMin)];
    };

    const point = getPointAtX(instance.mouse.x, 0);

    const drawCursor = (point: Vector) => {
      ctx.fillStyle = options.pointColor || 'blue';
      ctx.beginPath();
      ctx.arc(point.x, point.y, CURSOR_RADIUS, 0, TAU * 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(point.x, canvas.height);
      ctx.lineTo(point.x, 0);
      ctx.closePath();
      ctx.stroke();
    };

    drawCursor(point);
    //drawPoint(ctx, instance.mouse, 'red', 16);

    const updateTooltip = () => {
      const tooltipRect = instance.tooltip.el
        ? (instance.tooltip.el as HTMLElement).getBoundingClientRect()
        : { width: 0, height: 0, x: 0, y: 0 };

      const nextTooltipPos = point
        .mul(VEC2(1.0 / rx, 1.0 / ry))
        .add(VEC2(rect.left, rect.top));
      const pos = prevTooltipPos.lerp(
        nextTooltipPos,
        clamp(app.deltaTime * 8.0, 0, 1),
      );
      prevTooltipPos = pos;

      instance.tooltip.state.position = pos;

      instance.tooltip.state.opacity = Math.max(
        instance.invMouseDistance,
        instance.config.minTooltipOpacity || 0,
      );

      if (options.callback) {
        const index = getIndexAtX(instance.mouse.x, 0);
        options.callback(instance, dates[index], values[index], index);
      }
    };

    updateTooltip();
  };
};
