import { donutChart } from "../charts/donut";
import {
  DonutOptions,
  DonutSegment,
  defaultDonutOptions,
} from "../charts/donut/types";
import { lineChart } from "../charts/line";
import {
  LineChartOptions,
  defaultLineChartOptions,
} from "../charts/line/types";
import {
  ChartData,
  ChartFunction,
  ChartInitFunction,
  ChartOptions,
} from "../charts/types";
import { Tooltip } from "../components/tooltip";
import { VisdTooltipProps } from "../components/tooltip/types";
import {  smoothstep } from "../utils/etc";
import { VEC2, Vector } from "../utils/vector";
import { X, XElement, mount, xReactive } from "xel";

const INSTANCE_LIMIT = 10;

export interface VisdConfig {
  resolution: Vector;
  size?: Vector;
  scale?: number;
  container?: Element;
  tooltipContainer?: Element;
  shadowBlur?: number;
  shadowAlpha?: number;
  middleDisplay?: XElement;
  minTooltipOpacity?: number;
}

export type ChartInstance = {
  uid: string;
  fun: ChartFunction;
  config: VisdConfig;
};

export type InternalChartInstance = ChartInstance & {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: Vector;
  resolution: Vector;
  mouse: Vector;
  invMouseDistance: number;
  tooltip: XElement<VisdTooltipProps, VisdTooltipProps>;
  setTooltipBody: (body: XElement) => void;
};

export interface Visd {
  time: number;
  chartFunction: ChartFunction;
  running?: boolean;
  loopId: number;
  instances: InternalChartInstance[];
  mouse: Vector;
}

export type VisdApplication = {
  start: () => void;
  stop: () => void;
  insert: (instance: ChartInstance) => void;
  charts: {
    donut: ChartInitFunction;
    line: ChartInitFunction;
  };
};

const createApp = (cfg: VisdConfig): VisdApplication => {
  const { container } = cfg;

  const shadowAlpha = cfg.shadowAlpha || 0;
  const shadowBlur = cfg.shadowBlur || 0;

  const computeSizes = (res: Vector, s: Vector) => {
    const resolution = res.clone();
    const size = s.clone()
    
    resolution.x = resolution.x || 500;
    resolution.y = resolution.y || 500;
    const ratio = window.devicePixelRatio;

    size.x /= ratio;
    size.y /= ratio;
    resolution.x = resolution.x * ratio;
    resolution.y = resolution.y * ratio;
    return { resolution, size };
  };

  const createCanvas = (
    resolution: Vector,
    size: Vector
  ): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = resolution.x;
    canvas.height = resolution.y;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    canvas.style.objectFit = "contain";
    //canvas.setAttribute(
    //  "style",
    //  `width: ${W}px; height: ${H}px;`
    //);
    return canvas;
  };

  //  ctx.imageSmoothingEnabled = true
  //  ctx.imageSmoothingQuality = 'high'
  //  ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
  //  ctx.shadowBlur = shadowBlur

  const app: Visd = {
    time: 0,
    chartFunction: () => {},
    running: false,
    loopId: -1,
    instances: [],
    mouse: VEC2(0, 0)
  };

  //mount(tooltip, { target: container });

  const updateTooltip = (instance: InternalChartInstance) => {
    const rect = instance.canvas.getBoundingClientRect();
    instance.tooltip.state.position = app.mouse;//instance.mouse.add(VEC2(rect.x, rect.y));
    instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
  }

  const update = (visd: Visd) => {
    if (app.instances.length >= INSTANCE_LIMIT) {
      console.warn(`Instance limit reached. ${app.instances.length}`);
      stop();
      return;
    }
    for (let i = 0; i < app.instances.length; i++) {
      const instance = app.instances[i];
      
      const sizes = computeSizes(
        instance.config.resolution,// VEC2(instance.canvas.width, instance.canvas.height),
        instance.config.size//VEC2(instance.canvas.width, instance.canvas.height)
      );

      instance.canvas.width = sizes.resolution.x;
      instance.canvas.height = sizes.resolution.y;
      instance.canvas.style.width = `${sizes.size.x}px`;
      instance.canvas.style.height = `${sizes.size.y}px`;
      instance.canvas.style.maxWidth = '100%';
      instance.canvas.style.maxHeight = cfg.size ? `${cfg.size.y}px` : '100%';
      instance.canvas.style.objectFit = "contain";
      instance.size = VEC2(instance.canvas.width, instance.canvas.height);
      instance.resolution = sizes.resolution;
      instance.canvas.style.objectFit = "contain";

      const res = instance.resolution;
      const s = instance.size;
      const rect = instance.canvas.getBoundingClientRect();

      const rx = instance.canvas.width / rect.width;
      const ry = instance.canvas.height / rect.height;
      
      instance.mouse = app.mouse.clone();
      instance.mouse = instance.mouse.sub(VEC2(rect.x, rect.y)).mul(VEC2(rx, ry));

      
      //instance.resolution = instance.config.resolution;

      const center = app.instances[i].size.scale(0.5);
      app.instances[i].invMouseDistance = smoothstep(
        app.instances[i].size.y * 0.6,
        app.instances[i].size.y * 0.4,
        app.instances[i].mouse.distance(center)
      );
      

      instance.ctx.clearRect(
        0,
        0,
        ...[instance.canvas.width, instance.canvas.height]
      );

      updateTooltip(instance);
      app.instances[i].fun(app.instances[i]);
    }
    //app.chartFunction()
  };

  const stop = () => {
    app.running = false;
    if (app.loopId >= 0) {
      cancelAnimationFrame(app.loopId);
      app.loopId = -1;
    }
  };

  const loop = (time: number, visd: Visd) => {
    try  {
      if(!app.running) {
        cancelAnimationFrame(app.loopId);
        return;
      }
      visd.time = time;
      update(visd);
      //ctx.beginPath();
      //ctx.fillStyle = 'black';
      //ctx.arc(app.mouse.x, app.mouse.y, 4, 0, Math.PI*2.0);
      //ctx.closePath();
      //ctx.fill();
      app.loopId = requestAnimationFrame((time: number) => loop(time, visd));
    } catch (e) {
      console.error(e);
      stop();
      return () => {}
    }
    return () => {
      app.running = false;
      cancelAnimationFrame(app.loopId);
    };
  }; 

  const start = () => {
    if (app.running)  return;
    
    window.addEventListener("mousemove", (e): void => {
      app.mouse = VEC2(e.clientX, e.clientY);
    });

    app.running = true;
    loop(0, app);
  };

  const insert = (instance: ChartInstance) => {
    if (app.instances.find((inst) => inst.uid === instance.uid)) return;

    const sizes = computeSizes(
      instance.config.resolution,
      instance.config.size
    );

    const canvas = createCanvas(sizes.resolution, sizes.size);

    const container = instance.config.container || cfg.container;
    if (container) {
      container.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("unable to get context");

    
    const tooltip: XElement<VisdTooltipProps, VisdTooltipProps> = Tooltip.call({ position: VEC2(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid }) as XElement<VisdTooltipProps, VisdTooltipProps>;

    mount(tooltip, { target:  instance.config.tooltipContainer || container });

    const inst: InternalChartInstance = xReactive({
      ...instance,
      canvas: canvas,
      ctx,
      mouse: VEC2(0, 0),
      invMouseDistance: 0,
      resolution: sizes.resolution,
      size: sizes.size,
      tooltip,
      setTooltipBody: (body: XElement) => {
        tooltip.state.body = body;
      }
    });

    app.instances.push(inst);
  };

  const charts = {
    donut: (data: ChartData, options: ChartOptions = defaultDonutOptions) => {
      return (instance: InternalChartInstance) =>
        donutChart(app, instance, data, options);
    },
    line: (
      data: ChartData,
      options: ChartOptions = defaultLineChartOptions
    ) => {
      return (instance: InternalChartInstance) =>
        lineChart(app, instance, data, options);
    },
  }; 

  return { start, stop, insert, charts };
};

let vapp: VisdApplication | undefined = undefined;

export const VisdApp = (cfg: VisdConfig): VisdApplication => {
  return (vapp = (vapp || createApp(cfg)));
};
