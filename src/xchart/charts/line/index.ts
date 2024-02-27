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

  const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';
  const verticalPadding = 50;
  const fontSize = isString(options.fontSize)
    ? options.fontSize
    : isNumber(options.fontSize)
      ? pxToRemStr(options.fontSize)
      : `0.76rem`;
  //const fontSizeRem = 0.76;

  const w = instance.size.x;
  const h = instance.size.y;
  const vh = h - verticalPadding;
  const dims = [
    instance.resolution.x,
    instance.resolution.y,
    instance.size.x,
    instance.size.y,
    instance.canvas.width,
    instance.canvas.height,
  ];
  const minDim = Math.min(...dims);
  const maxDim = Math.max(...dims);

  const xAxisItems = [...(options.xAxis ? rangeToArray(options.xAxis.range) : [])];

  const colors = options.colors || defaultLineChartOptions.colors;
  //const callback = options.callback || (() => {});

  const values = [...data.values].map((v) => Math.max(0, v));
  const labels = data.labels ? data.labels : values.map(v => v.toFixed(3)); 

  const peak = Math.max(...values);
  const mid = median(values);
  const xlen = values.length;

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

  const maxYAxisLength = (() => {
    const lengths = yAxis.map(ax => {
      ctx.font =  options.yAxis && options.yAxis.font ? options.yAxis.font : `${fontSize} sans-serif`;
      const text = options.yAxis && options.yAxis.format ? options.yAxis.format(ax.value) : `${ax.value.toFixed(2)}`; 
      const m = ctx.measureText(text);
      return m.width;
    });

    return Math.max(...lengths);
  })();

  const yAxisLineLength = maxYAxisLength + 16;
  const xAxisLineLength = 35;
  const horizontalPadding = 0;
  const vw = w - (horizontalPadding + (yAxisLineLength / 2)) ;

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
      vw,
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

  const drawPoints = (pointsToDraw: Array<Point[]>) => {
    ctx.save();
    pointsToDraw.forEach(([a, b], i) => {
      let p = b.p;

      const mouseDist = instance.mouse.distance(b.p);
      let radius = 4.0;
      const s = smoothstep(options.dynamicSizePoints ? 48.0 : (radius/2), radius/8, mouseDist);

      if (options.dynamicSizePoints) {
        radius = lerp(2.0, 12.0, s);
      }

      ctx.globalAlpha =  options.drawOnlyClosestPoint ? 1 : smoothstep((1.0 / (minDim / maxDim))*50, 0.0, mouseDist);
      ctx.fillStyle = options.pointColor || colors[i % colors.length];

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0.0, Math.PI * 2.0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  };

  const drawLabel = (point: Point) => {
    const p = point.p;
    const mouseDist = instance.mouse.distance(p);
    const s = smoothstep((1.0 / (minDim / maxDim))*50, 0.0, mouseDist);

    const label = labels ? labels[clamp(point.index, 0, labels.length)] : undefined;

    if (label && s > 0) {
      const fontSize = lerp(1, 2, s);
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 0, 0, ${s})`;
      ctx.textAlign = 'center';
      ctx.font = `${fontSize}rem sans-serif`;
      ctx.fillText(`${label}`, p.x, p.y);
      ctx.closePath();
      ctx.restore();
    }
  };

  

  const xAxis: AxisPoint[] = (() => {
    return xAxisItems.map((item, i): AxisPoint => {
      const ni = i / xAxisItems.length;
      const x = (ni * (vw - (horizontalPadding + yAxisLineLength))) + yAxisLineLength;
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
      ctx.strokeStyle = GRID_COLOR;
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

      ctx.fillStyle = options.yAxis &&  options.yAxis.color ? options.yAxis.color : 'black';
      ctx.font =  options.yAxis && options.yAxis.font ? options.yAxis.font : `${fontSize} sans-serif`;
      ctx.beginPath();

      const text = options.yAxis && options.yAxis.format ? options.yAxis.format(ax.value) : `${ax.value.toFixed(2)}`; 
      
      ctx.fillText(text, x - (yAxisLineLength / 2), ax.p.y - 4);
      ctx.closePath();
    }
    ctx.restore();
  };

  const drawXAxis = (rotate: boolean = false) => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    for (let i = 0; i < xAxis.length; i++) {
      if (!rotate && i % 2 != 0) continue;
      const ax = xAxis[i];
      const text = `${ax.label ? ax.label : ax.value.toFixed(2)}`;
      ctx.font = options.xAxis && options.xAxis.font ? options.xAxis.font : `${fontSize} sans-serif`;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      const m = ctx.measureText(text);

      const x = ax.p.x;
      const y = ax.p.y + (rotate ? 0 : 16);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + yAxisLineLength);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = options.yAxis &&  options.yAxis.color ? options.yAxis.color : 'black';
      if (rotate) {
      ctx.beginPath();
      ctx.translate(
        yAxisLineLength / 2 + m.width / 2 + 2 * horizontalPadding,
        0,
      );
      ctx.translate(x - m.width, y);
      ctx.rotate((Math.PI / 180.0) * 30);
      ctx.fillText(text, 0, 0);
      ctx.closePath();
        ctx.resetTransform();
      } else {
        ctx.beginPath();
        ctx.fillText(text, x, y);
        ctx.closePath();
      }
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
    if (options.drawOnlyClosestPoint) {
      if (closestPoint) {
        drawPoints([[closestPoint, closestPoint]]);
      }
    } else {
      drawPoints(pointsToDraw);
    }
  }

  if (closestPoint && options.drawLabels) {
    drawLabel(closestPoint);
  }


  const drawCursor = () => {
    const mouse = instance.mouse;
    ctx.save();
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(horizontalPadding, mouse.y);
    ctx.lineTo(vw, mouse.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouse.x, verticalPadding);
    ctx.lineTo(mouse.x, vh);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  drawCursor();
  const updateTooltip = (instance: ChartInstance) => {
    const rect = instance.canvas.getBoundingClientRect();
    const tooltipRect = instance.tooltip.el ? (instance.tooltip.el as HTMLElement).getBoundingClientRect() : { width: 0, height: 0, x: 0, y: 0 };

    instance.tooltip.state.position = app.mouse.clone(); //instance.mouse.add(VEC2(rect.x, rect.y));
    instance.tooltip.state.position.y += (tooltipRect.height * 1.5);
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
