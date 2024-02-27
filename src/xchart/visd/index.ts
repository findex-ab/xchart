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
import { AABB, aabbVSPoint2D } from "../utils/aabb";
import {  clamp, smoothstep } from "../utils/etc";
import { VEC2, Vector } from "../utils/vector";
import { X, XElement, mount, xReactive } from "xel";

const INSTANCE_LIMIT = 10;

export interface VisdConfig {
  scale?: number;
  container?: Element;
  tooltipContainer?: Element;
  shadowBlur?: number;
  shadowAlpha?: number;
  middleDisplay?: XElement;
  minTooltipOpacity?: number;
}

export interface VisdInstanceConfig {
  resolution: Vector;
  aspectRatio?: Vector;
  fitContainer?: boolean;
  sizeClamp?: { min: Vector, max: Vector };
  size?: Vector;
  scale?: number;
  container?: Element;
  tooltipContainer?: Element;
  shadowBlur?: number;
  shadowAlpha?: number;
  middleDisplay?: XElement;
  minTooltipOpacity?: number;
  onlyActiveWhenMouseOver?: boolean;
}

export type ChartInstanceInit = {
  uid: string;
  fun: ChartFunction;
  config: VisdInstanceConfig;
  active?: boolean;
};


export type ChartInstance = {
  uid: string;
  fun: ChartFunction;
  config: VisdInstanceConfig;
  active?: boolean;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: Vector;
  resolution: Vector;
  mouse: Vector;
  invMouseDistance: number;
  tooltip: XElement<VisdTooltipProps, VisdTooltipProps>;
  didRender?: boolean;
  setTooltipBody: (body: XElement) => void;
  cancel: () => void;
  resume: () => void;
  xel: XElement;
};

export interface Visd {
  time: number;
  chartFunction: ChartFunction;
  running?: boolean;
  loopId: number;
  instances: ChartInstance[];
  mouse: Vector;
}

export type VisdApplication = {
  start: () => void;
  stop: () => void;
  insert: (instance: ChartInstanceInit) => ChartInstance;
  charts: {
    donut: ChartInitFunction;
    line: ChartInitFunction;
  };
};

const createApp = (cfg: VisdConfig): VisdApplication => {
  const computeSizes = (res: Vector, s: Vector, instanceCfg: VisdInstanceConfig, instance?: ChartInstance) => {
    const resolution = res.clone();
    const size = s.clone()
    
    resolution.x = resolution.x || 500;
    resolution.y = resolution.y || 500;

    
    const ratio = window.devicePixelRatio;

    size.x /= ratio;
    size.y /= ratio;
    resolution.x = resolution.x * ratio;
    resolution.y = resolution.y * ratio;

    if (instance && instance.xel && instance.xel.el) {
      let el = (instance.xel.el.parentElement || instance.xel.el) as HTMLElement;

      const rect = el.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) {
        size.x = clamp(size.x, instanceCfg.fitContainer ? rect.width : 0, rect.width);
        size.y = clamp(size.y, instanceCfg.fitContainer ? rect.height : 0, rect.height);
      }
    }

    if (instanceCfg.aspectRatio && instanceCfg.aspectRatio.mag() > 0.1) {
      size.y = size.x / instanceCfg.aspectRatio.x * instanceCfg.aspectRatio.y;
      resolution.y = resolution.x / instanceCfg.aspectRatio.x * instanceCfg.aspectRatio.y;
    }
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

  const update = (visd: Visd) => {
    if (app.instances.length >= INSTANCE_LIMIT) {
      console.warn(`Instance limit reached. ${app.instances.length}`);
      stop();
      return;
    }
    for (let i = 0; i < app.instances.length; i++) {
      const instance = app.instances[i];

      if (instance.didRender && instance.config.onlyActiveWhenMouseOver) {
        const rect = instance.canvas.getBoundingClientRect();
        const bounds: AABB = {
          min: VEC2(rect.x, rect.y),
          max: VEC2(rect.x + rect.width, rect.y + rect.height)
        };
        if (!aabbVSPoint2D(bounds, app.mouse)) {
          instance.tooltip.state.opacity = 0;
          if  (instance.tooltip.el) {
            (instance.tooltip.el as HTMLElement).style.opacity = '0%';
          }
          continue;
        }
      }

      if (!instance.active) continue;

      let resolution = instance.config.resolution;
      let size = instance.config.size;
      
      if (instance.config.fitContainer && instance.config.container) {
        const rect = instance.config.container.getBoundingClientRect();
        //const rect = { width: r.width, height: r.height };

        if (instance.config.sizeClamp) {
          const {min, max} = instance.config.sizeClamp;
          rect.width = clamp(rect.width, min.x, max.x);
          rect.height = clamp(rect.height, min.y, max.y);
        }
        
        size = VEC2(rect.width, rect.height);
        resolution = VEC2(rect.width, rect.height);

        
      }
      
      
      const sizes = computeSizes(
        resolution,
        size,
        instance.config,
        instance
      );


      
      
      instance.canvas.width = sizes.resolution.x;
      instance.canvas.height = sizes.resolution.y;
      instance.canvas.style.width = `${sizes.size.x}px`;
      instance.canvas.style.height = `${sizes.size.y}px`;

      
      
      instance.canvas.style.maxWidth = `min(${Math.max(resolution.x, size.x)}px, 100%)`;
      instance.canvas.style.maxHeight = instance.config.size ? `${instance.config.size.y}px` : '100%'; 
       
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

      
      app.instances[i].fun(app.instances[i]);
      app.instances[i].didRender = true;
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

  const insert = (instance: ChartInstanceInit): ChartInstance => {
    const old = app.instances.find((inst) => inst.uid === instance.uid);
    if (old) {
      old.cancel();
    }

    const sizes = computeSizes(
      instance.config.resolution,
      instance.config.size,
      instance.config
    );

    const canvas = createCanvas(sizes.resolution, sizes.size);

    const container = instance.config.container || cfg.container;
    //if (container) {
    //  container.appendChild(canvas);
    //}

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("unable to get context");

    
    const tooltip: XElement<VisdTooltipProps, VisdTooltipProps> = Tooltip.call({ position: VEC2(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid }) as XElement<VisdTooltipProps, VisdTooltipProps>;


    const inst: ChartInstance = xReactive({
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
      },
      active: true,
      cancel: () => {
        inst.canvas.remove();
        inst.active = false;
        app.instances = app.instances.filter(x => x.uid !== inst.uid);
      },
      resume: () => {
        inst.active = true;
      },
      xel: (() => {
        const xel: XElement = X<{ instance: ChartInstance }>('div', {
          onMount(self) {
            self.el.appendChild(canvas);
             mount(tooltip, { target:  instance.config.tooltipContainer || container || (self.el as HTMLElement) });
            app.instances.push(inst);
          },
          render() {
            return X('div', {  })
          }
        });

        return xel;
      })() 
    });


    return inst;
  };

  const charts = {
    donut: (data: ChartData, options: ChartOptions = defaultDonutOptions) => {
      return (instance: ChartInstance) =>
        donutChart(app, instance, data, options);
    },
    line: (
      data: ChartData,
      options: ChartOptions = defaultLineChartOptions
    ) => {
      return (instance: ChartInstance) =>
        lineChart(app, instance, data, options);
    },
  }; 

  return { start, stop, insert, charts };
};

let vapp: VisdApplication | undefined = undefined;

export const VisdApp = (cfg: VisdConfig): VisdApplication => {
  return (vapp = (vapp || createApp(cfg)));
};
