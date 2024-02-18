import { donutChart } from "../charts/donut";
import { DonutOptions, DonutSegment } from "../charts/donut/types";
import { lineChart } from "../charts/line";
import { LineChartOptions, defaultLineChartOptions } from "../charts/line/types";
import { ChartData, ChartFunction } from "../charts/types";
import { Tooltip } from "../components/tooltip";
import { VisdTooltipProps } from "../components/tooltip/types";
import { clearScreen } from "../draw";
import { range, smoothstep } from "../utils/etc";
import { hashf } from "../utils/hash";
import { VEC2, Vector } from "../utils/vector";
import { X, XElement, mount } from "xel";

export interface Visd {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: Vector;
  time: number;
  mouse: Vector;
  chartFunction: ChartFunction;
  loopId: number;
  invMouseDistance: number;
  running: boolean;
}

export interface VisdConfig {
//  resolution: Vector
  size?: Vector
  scale?: number
  container?: Element
  shadowBlur?: number
  shadowAlpha?: number
  middleDisplay?: XElement
}


export const VisdApp = (cfg: VisdConfig) => {
  const { size, container } = cfg

  size.x = size.x || 500
  size.y = size.y || 500
//  const size = cfg.size || size
  const ratio = window.devicePixelRatio

  size.x /= ratio;
  size.y /= ratio;
  size.x = size.x * ratio
  size.y = size.y * ratio

  const shadowAlpha = cfg.shadowAlpha || 0
  const shadowBlur = cfg.shadowBlur || 0



  const createCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    canvas.style.objectFit = 'contain';
    //canvas.setAttribute(
    //  "style",
    //  `width: ${W}px; height: ${H}px;`
    //);
    return canvas;
  }

  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')

  

  if (!ctx) throw new Error('Unable to get canvas context')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
  ctx.shadowBlur = shadowBlur

  const app: Visd = {
    canvas,
    ctx,
    size: size,
 //   size: size,
    time: 0,
    mouse: VEC2(0, 0),
    chartFunction: () => {},
    running: false,
    loopId: -1,
    invMouseDistance: 0,
  }

  const tooltip = Tooltip.call({})
  // @ts-ignore
  mount(tooltip, { target: container })

  const update = (visd: Visd) => {
    const { ctx } = visd

    const center = app.size.scale(0.5)
    app.invMouseDistance = smoothstep(
      app.size.y * 0.6,
      app.size.y * 0.4,
      app.mouse.distance(center)
    )
    const rect = canvas.getBoundingClientRect()
    tooltip.state.position = app.mouse.add(VEC2(rect.x, rect.y))
    tooltip.state.opacity = app.invMouseDistance

    // if (cfg.scale && cfg.scale > 0.00001) {
    //   ctx.scale(cfg.scale, cfg.scale);
    //}

    ctx.clearRect(0, 0, ...[app.size.x, app.size.y])
    app.chartFunction()
  }

  const loop = (time: number, visd: Visd) => {
    visd.time = time
    update(visd)
    //ctx.beginPath();
    //ctx.fillStyle = 'black';
    //ctx.arc(app.mouse.x, app.mouse.y, 4, 0, Math.PI*2.0);
    //ctx.closePath();
    //ctx.fill();
    app.loopId = requestAnimationFrame((time: number) => loop(time, visd))

    return () => {
      app.running = false
      cancelAnimationFrame(app.loopId)
    }
  }

  const start = (fun: ChartFunction) => {
    app.chartFunction = fun

    if (container) {
      container.appendChild(canvas)
    }

    window.addEventListener('mousemove', (e): void => {
      const rect = canvas.getBoundingClientRect()
      app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y)
    })

    //canvas.addEventListener('mouseenter', () => {

    //  if (!app.running) {
    //    loop(0, app);
    //    app.running = true;
    //  }
    //  tooltip.state.opacity = 1;
    //});

    //canvas.addEventListener('mouseleave', () => {
    //  if (app.running) {
    //    app.running = false;
    //    setTimeout(() => {
    //        cancelAnimationFrame(app.loopId);

    //        tooltip.state.opacity = 0;
    //    }, 10);
    //  }
    //})

    app.running = true
    loop(0, app)
  }

  const charts = {
    donut: (
      data: ChartData,
      options: DonutOptions,
      callback: (segment:DonutSegment) => void
    ) => {
      const center = app.size.scale(0.5);
      return () => donutChart(app, center, data, options, callback)
    },
    line: (
      data: ChartData,
      options: LineChartOptions = defaultLineChartOptions,
    ) => {
      return () => lineChart(app, data, options);
    }
  }

  //const charts = {
  //  donut: (data: ChartData, options: DonutOptions, callback: (segment: DonutSegment) => void) => {
  //    const center = app.size.scale(0.5)
  //    return () => donutChart(app, center, data, options, callback)
  //  }
  //}

  const setTooltipBody = (body: XElement) => {
    tooltip.state.body = body
  }

  return { start, charts, setTooltipBody, canvas }
}

export const VisdApp__backup = (cfg: VisdConfig) => {
  const { size, container } = cfg;

  size.x = size.x || 500;
  size.y = size.y || 500;
  const ratio = window.devicePixelRatio;
  const dpiRes = size.scale(ratio);

  const createCanvas = (size: Vector): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.setAttribute(
      "style",
      `width: ${size.x}px; height: ${size.y}px;`
    );
    return canvas;
  };

  const canvas = createCanvas(dpiRes);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  //ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  //ctx.shadowBlur = 12;

  const app: Visd = {
    canvas,
    ctx,
    size: dpiRes,
    time: 0,
    mouse: VEC2(0, 0),
    chartFunction: () => {},
    loopId: -1,
    invMouseDistance: 0,
    running: false
  };


  const tooltip = Tooltip.call({})
  // @ts-ignore
  mount(tooltip, { target: container })


  

  const update = (visd: Visd) => {
    const { ctx, size } = visd;

    const center = app.size.scale(0.5)
    app.invMouseDistance = smoothstep(
      app.size.y * 0.6,
      app.size.y * 0.4,
      app.mouse.distance(center)
    )
    const rect = canvas.getBoundingClientRect()
    tooltip.state.position = app.mouse.add(VEC2(rect.x, rect.y))
    tooltip.state.opacity = app.invMouseDistance

    // if (cfg.scale && cfg.scale > 0.00001) {
    //   ctx.scale(cfg.scale, cfg.scale);
    //}

    ctx.clearRect(0, 0, ...[app.size.x, app.size.y])
    app.chartFunction()
  }
    





  const loop = (time: number, visd: Visd) => {
    visd.time = time
    update(visd)
    //ctx.beginPath();
    //ctx.fillStyle = 'black';
    //ctx.arc(app.mouse.x, app.mouse.y, 4, 0, Math.PI*2.0);
    //ctx.closePath();
    //ctx.fill();
    app.loopId = requestAnimationFrame((time: number) => loop(time, visd))

    return () => {
      app.running = false
      cancelAnimationFrame(app.loopId)
    }
  }

  const start = (fun: ChartFunction) => {
    app.chartFunction = fun

    if (container) {
      container.appendChild(canvas)
    }

    window.addEventListener('mousemove', (e): void => {
      const rect = canvas.getBoundingClientRect()
      app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y)
    })

    //canvas.addEventListener('mouseenter', () => {

    //  if (!app.running) {
    //    loop(0, app);
    //    app.running = true;
    //  }
    //  tooltip.state.opacity = 1;
    //});

    //canvas.addEventListener('mouseleave', () => {
    //  if (app.running) {
    //    app.running = false;
    //    setTimeout(() => {
    //        cancelAnimationFrame(app.loopId);

    //        tooltip.state.opacity = 0;
    //    }, 10);
    //  }
    //})

    app.running = true
    loop(0, app)
  }





  

//  const loop = (time: number, visd: Visd) => {
//    visd.time = time;
//    update(visd);
//    app.loopId = requestAnimationFrame((time: number) => loop(time, visd));
//  };
//
//
  const stop = () => {
    app.running = false;
    if (app.loopId >= 0) {
      cancelAnimationFrame(app.loopId);
      app.loopId = -1;
    }
  }
//
//  const start = (fun: ChartFunction) => {
//
//    let mounted = false;
//    
//    if (container) {
//      container.appendChild(canvas);
//    }
//
//    window.addEventListener("mousemove", (e):void => {
//      const rect = canvas.getBoundingClientRect();
//      app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y).scale(ratio);
//
//      if (!mounted) {
//        tooltip.el = undefined;
//        mount(tooltip, { target: container });
//        mounted = true;
//      }
//
//      tooltip.state.position = VEC2(e.x, e.y);
//    });
//
//    app.chartFunction = fun;
//    
//    loop(0, app);
//  };

  const charts = {
    donut: (
      data: ChartData,
      options: DonutOptions,
      callback: (segment:DonutSegment) => void
    ) => {
      const center = app.size.scale(0.5);
      return () => donutChart(app, center, data, options, callback)
    },
    line: (
      data: ChartData,
      options: LineChartOptions = defaultLineChartOptions,
    ) => {
      return () => lineChart(app, data, options);
    }
  }

  const setTooltipBody = (body: XElement) => {
    tooltip.state.body = body;
  }

  return { start, stop, charts, setTooltipBody };
};
