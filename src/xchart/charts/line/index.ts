import { ChartInstance, Visd } from '../../visd';
import { ChartData, ChartOptions, ChartRunFunction } from '../types';
import {
  LineChartState,
  defaultLineChartOptions,
} from './types';
import { VEC2, VEC3, Vector } from '../../utils/vector';
import { clamp, lerp, median, smoothstep } from '../../utils/etc';
import { hexToUint32, nthByte } from '../../utils/hash';
import { pxToRemStr  } from '../../utils/style';
import { rangeToArray } from '../../types/range';
import { isNumber, isString } from '../../utils/is';


type Point = {
  p: Vector;
  index: number;
};

type AxisPoint = {
  p: Vector;
  value: number;
  label?: string;
};

export const lineChart: ChartRunFunction = (
  app: Visd,
  instance: ChartInstance,
  data: ChartData,
  options: ChartOptions = defaultLineChartOptions,
): LineChartState => {
  const ctx = instance.ctx;

  const verticalPadding = 50;
  const horizontalPadding = 30;
  const fontSize = isString(options.fontSize)
    ? options.fontSize
    : isNumber(options.fontSize)
      ? pxToRemStr(options.fontSize)
      : `0.76rem`;
  //const fontSizeRem = 0.76;

  const w = instance.size.x;
  const h = instance.size.y;
  const yAxisLineLength = 45;
  const xAxisLineLength = 35;
  const vh = h - verticalPadding;
  const vw = w - horizontalPadding;

  const colors = options.colors || defaultLineChartOptions.colors;
  //const callback = options.callback || (() => {});

  const values = [...data.values].map((v) => Math.max(0, v));
  const peak = Math.max(...values);
  const mid = median(values);
  const xlen = values.length;

  const points = values.map((v, i) => {
    const nx = i / xlen;
    const ny = v / (peak + (verticalPadding / vh) * peak);
    const x = nx * (vw - yAxisLineLength) + yAxisLineLength;
    const y = Math.max(0, vh - ny * vh); //offBottom + (((paddingBot + h) - ny * (h - paddingTop)));
    return { p: VEC2(x, y), index: i };
  });

  const linePoints = (() => {
    if (points.length <= 0) return;
    const result: Array<Array<Point>> = [];
    for (let i = 0; i < points.length - 2; i += 1) {
      const a = points[i];
      const b = points[clamp(i + 1, 0, points.length - 1)];
      const mouseDist = instance.mouse.distance(b.p);

      const mix = clamp(smoothstep(200.0, 0.0, mouseDist), 0, 1);
      const c = a.p.lerp(b.p, 0.5 + 0.5 * mix);
      //const xc = (a.p.x + b.p.x) * 0.5;
      //const yc = (a.p.y + b.p.y) * 0.5;
      result.push([
        { p: a.p, index: a.index },
        { p: c, index: i + 1 },
      ]);
    }
    return result;
  })();

  const drawSmoothPath = () => {
    if (linePoints.length <= 0) return;
    if (linePoints[0].length <= 0) return;
    ctx.save();
    ctx.beginPath();
    const first = linePoints[0][0];
    const last = linePoints[linePoints.length - 1][0];

    const strokeGrad = ctx.createLinearGradient(
      first.p.x,
      first.p.y,
      last.p.x,
      last.p.y,
    );
    const fillGrad = ctx.createLinearGradient(0, 0, 0, vh);
    colors.forEach((color, i) => {
      strokeGrad.addColorStop(i / colors.length, color);
    });
    const c = hexToUint32(colors[2 % colors.length]);
    const B = nthByte(c, 1);
    const G = nthByte(c, 2);
    const R = nthByte(c, 3);
    const rgb = VEC3(R, G, B);
    fillGrad.addColorStop(1, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.25})`);
    fillGrad.addColorStop(0.5, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${0.75})`);
    fillGrad.addColorStop(0, `rgba(${rgb.x}, ${rgb.y}, ${rgb.z}, ${1.0})`);
    ctx.strokeStyle = strokeGrad;
    ctx.fillStyle = fillGrad;
    ctx.lineWidth = options.thick || 2;

    ctx.moveTo(...points[0].p.xy);
    linePoints.forEach(([a, b]) => {
      ctx.quadraticCurveTo(a.p.x, a.p.y, b.p.x, b.p.y);
    });

    let i = linePoints.length;
    ctx.quadraticCurveTo(
      points[i].p.x,
      points[i].p.y,
      points[i + 1].p.x,
      points[i + 1].p.y,
    );
    ctx.quadraticCurveTo(
      points[i + 1].p.x,
      points[i + 1].p.y,
      vw - (0 - yAxisLineLength),
      vh,
    );
    ctx.quadraticCurveTo(vw, vh, yAxisLineLength, vh);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawPath = () => {
    if (points.length <= 0) return;

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[clamp(i + 1, 0, points.length - 1)];

      ctx.save();
      ctx.beginPath();

      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = options.thick || 2;
      ctx.moveTo(a.p.x, a.p.y);
      ctx.lineTo(b.p.x, b.p.y);

      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  };

  const pointsToDraw = [
    [points[0], points[0]],
    ...linePoints,
    [points[points.length - 1], points[points.length - 1]],
  ];

  const drawPoints = () => {
    ctx.save();
    pointsToDraw.forEach(([a, b], i) => {
      let p = b.p;

      const mouseDist = instance.mouse.distance(b.p);
      const s = smoothstep(48.0, 0.0, mouseDist);
      const radius = lerp(2.0, 12.0, s);

      ctx.fillStyle = colors[i % colors.length];

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0.0, Math.PI * 2.0);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  };

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
  };

  const yAxis = (() => {
    const result: AxisPoint[] = [];
    const max = Math.max(1, peak); //(offBottom+h)-(paddingY + Yoff);
    const step = Math.max(1, Math.floor(mid / vh) * 2);
    const N = max / step;
    for (let i = 0; i < N; i++) {
      const ni = i / N;
      const y = Math.max(verticalPadding, vh - step * (ni * vh)); // - xAxisLineLength;//offBottom + ((((paddingBot + h) - ni * (h - paddingTop))));
      if (y <= verticalPadding) break;

      const ny = (step * (ni * vh)) / vh;
      result.push({ p: VEC2(verticalPadding, y), value: ny * peak });
    }

    return result.reverse();
  })();

  const xAxis: AxisPoint[] = (() => {
    if (!options.xAxis) return [] as AxisPoint[];
    const arr = rangeToArray(options.xAxis.range);

    return arr.map((item, i): AxisPoint => {
      const ni = i / arr.length;
      const x = ni * (vw - horizontalPadding);
      const y = h - xAxisLineLength;
      return {
        p: VEC2(x, y),
        value: ni,
        label: options.xAxis.format ? options.xAxis.format(item) : `${item}`,
      };
    });
  })();

  const drawYAxis = () => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    for (let i = 0; i < yAxis.length; i++) {
      const ax = yAxis[i];
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const x = ax.p.x - horizontalPadding;
      ctx.moveTo(x, ax.p.y);
      ctx.lineTo(x + yAxisLineLength, ax.p.y);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + yAxisLineLength, ax.p.y);
      ctx.lineTo(vw, ax.p.y);
      ctx.closePath();
      ctx.stroke();

      ctx.font = `${fontSize} sans-serif`;
      ctx.beginPath();
      ctx.fillText(`${ax.value.toFixed(2)}`, x, ax.p.y - 4);
      ctx.closePath();
    }
    ctx.restore();
  };

  const drawXAxis = () => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    for (let i = 0; i < xAxis.length; i++) {
      const ax = xAxis[i];
      const text = `${ax.label ? ax.label : ax.value.toFixed(2)}`;
      ctx.font = `${fontSize} sans-serif`;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      const m = ctx.measureText(text);

      ctx.beginPath();
      ctx.moveTo(ax.p.x, ax.p.y);
      ctx.lineTo(ax.p.x, ax.p.y + yAxisLineLength);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.translate(
        yAxisLineLength / 2 + m.width / 2 + 2 * horizontalPadding,
        0,
      );
      ctx.translate(ax.p.x - m.width, ax.p.y);
      ctx.rotate((Math.PI / 180.0) * 30);
      ctx.fillText(text, 0, 0);
      ctx.closePath();
      ctx.resetTransform();
    }
    ctx.restore();
  };

  drawYAxis();
  drawXAxis();

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

  if (options.smoothPath) {
    drawSmoothPath();
  } else {
    drawPath();
  }

  if (options.drawPoints) {
    drawPoints();
  }

  if (closestPoint && options.drawLabels) {
    drawLabel(closestPoint);
  }

  const updateTooltip = (instance: ChartInstance) => {
    const rect = instance.canvas.getBoundingClientRect();

    instance.tooltip.state.position = app.mouse; //instance.mouse.add(VEC2(rect.x, rect.y));
    instance.tooltip.state.opacity = Math.max(
      instance.invMouseDistance,
      instance.config.minTooltipOpacity || 0,
    );
  };

  updateTooltip(instance);

  if (options.callback) {
    if (closestPoint) {
      options.callback(
        instance,
        values[closestPoint.index] || 0,
        closestPoint.index || 0,
      );
    }
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
