import { RangeScalar, rangeToArray } from '../../types/range';
import { Padding } from '../../types/style';
import {
  clamp,
  fract,
  lerp,
  lerpDates,
  range,
  rangeFromTo,
  remap,
  smoothstep,
  stepRange,
} from '../../utils/etc';
import { VEC2, VEC3, Vector } from '../../utils/vector';
import { Visd } from '../../visd';
import * as fns from 'date-fns';
import {
  ChartData,
  ChartOptions,
  ChartSetupFunction,
  ChartUpdateFunction,
} from '../types';
import { LineChartState, defaultLineChartOptions } from './types';
import { isDate } from '../../utils/date';
import { isString } from '../../utils/is';
import { noise } from '../../utils/noise';
import { hexToUint32, nthByte } from '../../utils/hash';

type DrawTextOptions = {
  text: RangeScalar;
  pos: Vector;
  font?: string;
  color?: string;
  measure?: boolean;
};
// draw line from A to B
const drawLine = (
  ctx: CanvasRenderingContext2D,
  a: Vector,
  b: Vector,
  color: string = 'black',
  thick: number = 1
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thick
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

const drawText = (ctx: CanvasRenderingContext2D, options: DrawTextOptions) => {
  const font = options.font || `1rem sans-serif`;
  const color = options.color || 'black';
  const text = options.text;
  const pos = options.pos;

  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.fillText(text + '', pos.x, pos.y);
  ctx.closePath();
  ctx.restore();
};

const drawPoints = (ctx: CanvasRenderingContext2D, points: Vector[]) => {
  ctx.save();
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[clamp(i + 1, 0, points.length - 1)];
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

const drawCurve = (ctx: CanvasRenderingContext2D, points: Vector[]) => {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points) {
    const xMid = (point.x + point.x) / 2;
    const yMid = (point.y + point.y) / 2;
    const cpX1 = (xMid + point.x) / 2;
    const cpX2 = (xMid + point.x) / 2;
    ctx.quadraticCurveTo(cpX1, point.y, xMid, yMid);
    ctx.quadraticCurveTo(cpX2, point.y, point.x, point.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const createCurvePoints = (
  points: Vector[],
) => {
  let result: Array<Vector[]> = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[clamp(i + 1, 0, points.length - 1)];

    const c = a.lerp(b, 0.5);

    result.push([a, c]);
  }

  return result;
};

const drawCurve2 = (
  ctx: CanvasRenderingContext2D,
  points: Vector[],
  w: number,
  h: number,
  padding: Padding,
  colors: string[] = ['#FF0000', '#00FF00']
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
  ctx.quadraticCurveTo(points[i + 1].x, points[i + 1].y, w, h - padY);
  ctx.quadraticCurveTo(w, h - padY, padding.left, h - padY);
  //ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawPoint = (ctx: CanvasRenderingContext2D, point: Vector, color: string = 'red', radius: number = 10) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const measureText = (
  ctx: CanvasRenderingContext2D,
  options: DrawTextOptions,
): TextMetrics => {
  const font = options.font || `1rem sans-serif`;
  const text = options.text;

  ctx.save();
  ctx.font = font;
  const m = ctx.measureText(text + '');
  ctx.restore();
  return m;
};

type TickObject = Omit<DrawTextOptions, 'text'> & {
  value: RangeScalar;
  text: RangeScalar;
  pos: Vector;
};

export const lineChart2: ChartSetupFunction = (
  app: Visd,
  data: ChartData,
  options: ChartOptions = defaultLineChartOptions,
): ChartUpdateFunction => {
  const yValues = data.values.map((v) => v);
  const xValues =
    (options.xAxis ? rangeToArray(options.xAxis.range) : data.labels || []) ||
    data.labels ||
    yValues;

  if (yValues.length <= 0 || xValues.length <= 0) return () => {};
  const peakY = Math.max(...yValues);
  const minY = Math.min(...yValues);
  let peakX = 0;
  let minX = 0;

  if (isDate(xValues[0]) || ( isString(xValues[0]) &&  xValues[0].includes('T') && xValues[0].includes('Z'))) {
    const dates = [...xValues].map(it => new Date(it)) as Date[];
    const sorted = dates.sort((a, b) => fns.compareAsc(a, b));
    peakX = sorted[sorted.length - 1].getTime();
    minX = sorted[0].getTime();
  }

  const formatX = (x: RangeScalar): string => {
    if (options.xAxis?.format) return options.xAxis.format(x);
    return isString(x) ? x : isDate(x) ? fns.format(x, 'y-m-d') : x.toFixed(2);
  };

  const formatY = (y: RangeScalar): string => {
    if (options.yAxis?.format) return options.yAxis.format(y);
    return isString(y) ? y : isDate(y) ? fns.format(y, 'y-m-d') : y.toFixed(2);
  };

  const GRID_COLOR = 'rgba(0, 0, 0, 0.1)';

  let tooltipPos = app.mouse.clone();
  let tooltipPosPrev = tooltipPos.clone();
  
  const colors = options.colors || defaultLineChartOptions.colors;
  return (instance) => {
    const rect = instance.canvas.getBoundingClientRect();
    const rx = instance.canvas.width / rect.width;
    const ry = instance.canvas.height / rect.height;
    
    const paddingAround = 10;
    const padding: Padding = {
      left: 0,
      right: paddingAround / 2,
      top: paddingAround * 2,
      bottom: paddingAround * 2,
    };

    const textMarginBottom = paddingAround;

    //    padding.bottom = lerp(padding.bottom, padding.bottom*2, 0.5+0.5*Math.sin(app.time*0.003));
    const ctx = instance.ctx;

    // ===================== Y ticks
    const size = instance.resolution;
    const h = size.y;
    const vh = h - (padding.bottom + padding.top);
    const numYTicks = Math.floor(
      options.yAxis?.ticks ||
        clamp(Math.log10(peakY), Math.max(1, 4 * (size.x / vh)), 100),
    );
    const yStep = Math.max(1, Math.ceil(vh / numYTicks));

    const yTicks = stepRange(vh, yStep);
    const yTickValues = yTicks.map((st) =>
      lerp(minY, peakY, st / ((yTicks.length - 1) * yStep)),
    );

    const yTickObjects: TickObject[] = yTicks.map((st, i) => {
      return {
        text: formatY(yTickValues[i]),
        value: yTickValues[i],
        pos: VEC2(padding.left, (vh - st) - padding.bottom),
        font: options.yAxis?.font,
        color: options.yAxis?.color
      };
    });

    const yTickMeasures = yTickObjects.map((obj) => measureText(ctx, obj));
    const yTickWidths = yTickMeasures.map((m) => m.width);
    const maxYTickWidth = Math.max(...yTickWidths);
    padding.left += (maxYTickWidth + 8);

    yTickObjects.forEach((obj) => {
      drawText(ctx, {...obj, pos: obj.pos.add(VEC2(0, -4))});

      drawLine(
        ctx,
        VEC2(obj.pos.x, obj.pos.y),
        VEC2(obj.pos.x + (size.x - 0.5 * padding.left), obj.pos.y),
        GRID_COLOR,
        2
      );
    });

    // ===================== X ticks
    const w = remap(
      instance.resolution.x,
      0,
      instance.resolution.x,
      padding.left,
      instance.resolution.x - padding.right,
    ); //instance.resolution.x - padding.left;


    const xTickObjects: TickObject[] = xValues.map((v, i) => {

      
      return {
        text: formatX(v),
        value:v,
        pos: VEC2(padding.left + (i*100), vh + padding.bottom - textMarginBottom),
        font: options.xAxis?.font,
        color: options.xAxis?.color
      };
    });

    //const xTickMeasures = xTickObjects.map(obj => measureText(ctx, obj));

    xTickObjects.forEach((obj) => {
      drawText(ctx, obj);
    });

    // =================== points

    let points: Vector[] = [];

    //for (let i = 0; i < xTickObjects.length; i++) {
    //  const xObj = xTickObjects[i];
    //  const x = xObj.pos.x;
    //  const nx = x / w;
    //  const coord = nx * yValues.length;
    //  const yIndex = Math.floor(coord);
    //  const lv = fract(coord);
    //  let y = yValues[clamp(yIndex, 0, yValues.length-1)];
    //  y /= peakY;
    //  y *= h;
    //  y = h - y;

    //  points.push(VEC2(x, y));
    //}

    for (let i = 0; i < yValues.length; i++) {
      const value = yValues[i];
      const nv = remap(value, minY, peakY, 0, 1);
      const ni = i / yValues.length;
    //  const xIndex = clamp(
    //    Math.floor(ni * (xTickObjects.length - 1)),
    //    0,
    //    xTickObjects.length - 1,
    //  );
    //  const yIndex = clamp(
    //    Math.floor(ni * (yTickObjects.length - 1)),
    //    0,
    //    yTickObjects.length - 1,
    //  );

    //  const xObj = xTickObjects[xIndex];
    //  const yObj = yTickObjects[yIndex];

      //const y = (h - padding.bottom) - (nv * (h - (padding.bottom + padding.top)));//Math.floor(nv*(h - (padding.bottom+padding.top)));
      //const x = xObj.pos.x;
      //const y = yObj.pos.y;

      const yPositions = yTickObjects.map((obj) => obj.pos);
      const yComponents = yPositions.map((p) => p.y);
      const maxYPos = Math.max(...yComponents);
      const minYPos = Math.min(...yComponents);

      let x = padding.left + ni * (w - padding.left * 0.5);
      let y = remap(value, minY, peakY, maxYPos, minYPos);

      const pos = VEC2(x, y);
      //    const dist = pos.distance(instance.mouse);

      //      pos.y -= 100.0 * smoothstep(200, 0.0, dist);

      //const y = (vh - (nv * vh));//minYPos + (nv * (maxYPos - minYPos));//remap(nv, 0, 1, minYPos, maxYPos);
      //const y = remap(value, minY, peakY, Math.min(...yTickObjects.map(it => it.pos.y)), Math.max(...yTickObjects.map(it => it.pos.y)));
      points.push(pos);
    }

   // const curvePoints = createCurvePoints(points);
    drawCurve2(ctx, points, w, h - padding.bottom, padding, colors || []);

    const left = padding.left;
    const right = w;

    const getMousePointIndex = () => {
      let mx = (app.mouse.x - rect.x);
      const L = padding.left;
      const R = right;
      mx = mx / (rect.width);

      mx *= (R - 0.5*L);
      mx -= L;
      const ww = Math.abs((R - L));
      const ni = clamp(mx / ww, 0, 1);
      
      //const ni = clamp(
      //  Math.floor((remap(instance.mouse.x, 0, instance.canvas.width,
      //        left, right
      //  ))) / Math.abs(right),
      //  0,
      //  1,
      //); 
      return clamp(
        Math.ceil((ni * (points.length))),
        0,
        points.length - 1,
      );
    };


    
    const getCoord = (pos: Vector) => {
      const x = (() => {
        const numSteps = xValues.length;
        const stepSize = Math.ceil(size.x / numSteps);
        return Math.floor(pos.x / stepSize) * stepSize;
      })();
      const y = (() => {
        const numSteps = yValues.length;
        const stepSize = Math.ceil(size.y / numSteps);
        return Math.floor(pos.y / stepSize) * stepSize;
      })();

      return VEC2(x, y);
    }

    const getDataCoord = (pos: Vector) => {
      const coord = getCoord(pos);
      const ix = clamp(Math.floor(coord.x / Math.ceil(size.x / xValues.length)), 0, xValues.length-1);
      const iy = clamp((yValues.length-1)-Math.floor(coord.y / Math.ceil(size.y / yValues.length)), 0, yValues.length-1);
      return VEC2(ix, iy);
    }


    const drawStuff = () => {
      const xy = getCoord(instance.mouse);

      drawText(ctx, {
        text: `${Math.floor(xy.x/Math.ceil(w/xValues.length))} | ${xValues.length}`,
        color: 'black',
        pos: VEC2(w/2, h/2)
      });

      const drawRealX = () => {
        const numSteps = xValues.length;
        const stepSize = Math.ceil(w / numSteps);

        let x = instance.mouse.x;
        x = Math.floor(x / stepSize) * stepSize;

        drawPoint(ctx, VEC2(x, vh-30), 'green', 10);

        for (let i = 0; i < numSteps; i++) {
          drawLine(ctx, VEC2(i*stepSize, vh-8), VEC2(i*stepSize, vh-60), 'red', 2);
        }
      }

      const drawRealY = () => {
        const numSteps = yValues.length;
        const stepSize = Math.ceil(h / numSteps);

        let y = instance.mouse.y;
        y = Math.floor(y / stepSize) * stepSize;

        drawPoint(ctx, VEC2(0, y), 'green', 10);

        for (let i = 0; i < numSteps; i++) {
          drawLine(ctx, VEC2(0, i*stepSize), VEC2(60, i*stepSize), 'blue', 2);
        }
      }

      drawRealX();
      //drawRealY();
      drawPoint(ctx, VEC2(xy.x, xy.y), 'purple', 10);
      //drawTickX();
    }

    drawStuff();

    const mouseInteraction = () => {

      drawLine(ctx, VEC2(instance.mouse.x, vh), VEC2(instance.mouse.x, 0), GRID_COLOR, 2);

      let mx = (app.mouse.x - rect.x);
      const L = padding.left;
      const R = right;
      mx = mx / (rect.width);

      mx *= (R - 0.5*L);
      mx -= L;
      const ww = Math.abs((R - L));
      const nx = clamp(mx / ww, 0, 1);
      
      
      //const nx = clamp(
      //  Math.max(
      //    0,
      //    (instance.mouse.x / instance.canvas.width) * (right - left) -
      //      maxYTickWidth,
      //  ) /
      //    (w - 2 * padding.left),
      //  0,
      //  1,
      //);

      const valueIndex = Math.round(
        clamp(nx * (yValues.length - 1), 0, yValues.length - 1),
      );

      const xValueIndex = (
        clamp(Math.floor(nx * (xValues.length)), 0, xValues.length - 1)
      );

      const value = yValues[valueIndex];
      const key1 = xValues[xValueIndex];
      

      const key = key1;
      const idx = getMousePointIndex();
      const point = points[idx] || VEC2(0, 0);//(curvePoints[idx][1] || curvePoints[idx][0]).clone();

      drawPoint(ctx, VEC2(lerp(point.x, instance.mouse.x, 0.5), point.y), options.pointColor || 'red', 8);

      const updateTooltip = () => {
        
        const tooltipRect = instance.tooltip.el
          ? (instance.tooltip.el as HTMLElement).getBoundingClientRect()
          : { width: 0, height: 0, x: 0, y: 0 };


        
        const x = lerp(rect.x+(point.x/rx), app.mouse.x, 0.5);
        const y = Math.min((rect.y + (point.y/ry)) - tooltipRect.height, app.mouse.y);

        const nextTooltipPos = VEC2(x, y);
        const pos = tooltipPosPrev.lerp(nextTooltipPos, clamp(app.deltaTime*8.0, 0, 1));
        tooltipPosPrev = pos;
        
        instance.tooltip.state.position = pos;
        

        instance.tooltip.state.opacity = Math.max(
          instance.invMouseDistance,
          instance.config.minTooltipOpacity || 0,
        );
      };

      //   drawLine(ctx, VEC2(left, vh/2), VEC2(right, vh/2));

      updateTooltip();
      if (options.callback) {
        options.callback(instance, key, value, valueIndex);
      }
    };

    mouseInteraction();

    return {};
  };
};
