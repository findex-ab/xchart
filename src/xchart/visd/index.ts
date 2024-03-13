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
import { EActionType, IAction } from "../types/action";
import { AABB, aabbVSPoint2D } from "../utils/aabb";
import { removeItemAtIndex, uniqueBy } from "../utils/array";
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
  responsive?: boolean;
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
  onMount?: (instance: ChartInstance) => void
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
  renderCount: number;
  setTooltipBody: (body: XElement) => void;
  cancel: () => void;
  resume: () => void;
  xel: XElement;
};

export interface Visd {
  time: number;
  deltaTime: number;
  lastTime: number;
  chartFunction: ChartFunction;
  running?: boolean;
  loopId: number;
  instances: ChartInstance[];
  mouse: Vector;
  actionQueue: IAction[];
}

export type VisdApplication = {
  visd: Visd;
  start: () => void;
  stop: () => void;
  insert: (instance: ChartInstanceInit) => ChartInstance;
  charts: {
    donut: ChartInitFunction;
    line: ChartInitFunction;
  };
  request: (action: IAction) => void;
};

const createApp = (cfg: VisdConfig): VisdApplication => {
  const computeSizes = (res: Vector, s: Vector, instanceCfg: VisdInstanceConfig, instance?: ChartInstance) => {
    const resolution = res.clone();
    const size = s.clone()
    
    resolution.x = resolution.x || 500;
    resolution.y = resolution.y || 500;

    
    //const ratio = window.devicePixelRatio;

    //size.x /= ratio;
    //size.y /= ratio;
    //resolution.x = resolution.x * ratio;
    //resolution.y = resolution.y * ratio;

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
    canvas.style.width = `${size.x}px`;//`100%`;
    canvas.style.height =  `${size.y}px`;///`100%`;
    canvas.style.objectFit = "contain";
    //canvas.setAttribute(
    //  "style",
    //  `width: ${W}px; height: ${H}px;`
    //);
    return canvas;
  };

 

  const app: Visd = {
    time: 0,
    deltaTime: 0,
    lastTime: 0,
    chartFunction: () => {},
    running: false,
    loopId: -1,
    instances: [],
    mouse: VEC2(0, 0),
    actionQueue: []
  };

  //mount(tooltip, { target: container }); 

  const update = (visd: Visd) => {

    
    
    if (app.instances.length >= INSTANCE_LIMIT) {
      app.instances = uniqueBy(app.instances, 'uid');
      console.warn(`Instance limit reached. ${app.instances.length}`);
      return;
    }
    for (let i = 0; i < app.instances.length; i++) {
      const instance = app.instances[i];
      const actions = app.actionQueue.filter(action => action.instanceUid === instance.uid);
      const proceed = !!actions.find(action => action.type === EActionType.UPDATE);

      if (instance.renderCount >= 60 && instance.config.onlyActiveWhenMouseOver && !proceed) {
        const rect = instance.canvas.getBoundingClientRect();
        const bounds: AABB = {
          min: VEC2(rect.x, rect.y),
          max: VEC2(rect.x + rect.width, rect.y + rect.height)
        };
        if (!aabbVSPoint2D(bounds, app.mouse)) {
          instance.tooltip.state.opacity = 0;
          if  (instance.tooltip.el) {
            (instance.tooltip.el as HTMLElement).style.opacity = '0%';
            (instance.tooltip.el as HTMLElement).style.pointerEvents = 'none';
          }
          continue;
        }
      }

      if (!instance.active && !proceed && instance.renderCount >= 60) continue;

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
      
      instance.canvas.style.width = `${sizes.size.x}px`;//`100%`;
      instance.canvas.style.height = `${sizes.size.y}px`;//`100%`;

      if (instance.config.responsive && instance.xel && instance.xel.el) {
        const el = (instance.xel.el) as HTMLElement;
        const parent = (instance.xel.el.parentElement || instance.xel.el) as HTMLElement;
        const elRect = el.getBoundingClientRect();
        //const elRectParent = parent.getBoundingClientRect();
        let width = parseFloat(getComputedStyle(parent).width);//Math.max(elRect.width, elRectParent.width);
        let height = elRect.height;

        instance.canvas.style.width = `${width}px`;
        instance.canvas.style.height = `${height}px`;
        instance.canvas.style.maxWidth = `${width}px`;
        instance.canvas.style.maxHeight = `${height}px`;

        const canvasRect = instance.canvas.getBoundingClientRect();
        instance.size.x = canvasRect.width;
        instance.size.y = canvasRect.height;
      } else if (instance.config.fitContainer && instance.xel && instance.xel.el) {
        const el = (instance.xel.el.parentElement || instance.xel.el) as HTMLElement;

        const style = getComputedStyle(el);
        
        instance.canvas.style.width = style.width;
        instance.canvas.style.height = style.height;
      } else {
      
        instance.canvas.style.maxWidth = `min(${Math.max(resolution.x, size.x)}px, 100%)`;
        instance.canvas.style.maxHeight = instance.config.size ? `${instance.config.size.y}px` : '100%'; 
       
        instance.size = VEC2(instance.canvas.width, instance.canvas.height);
        instance.resolution = sizes.resolution;
      }

      instance.canvas.width = sizes.resolution.x;
      instance.canvas.height = sizes.resolution.y;
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


      instance.ctx.imageSmoothingEnabled = true
      instance.ctx.imageSmoothingQuality = 'high'
      //instance.ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
      //instance.ctx.shadowBlur = shadowBlur
      
      app.instances[i].fun(app.instances[i]);
      app.instances[i].renderCount += 1;

      app.actionQueue = app.actionQueue.filter(action => action.instanceUid !== instance.uid);
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
    app.deltaTime = (time - app.lastTime) / 1000;
    app.lastTime = time;

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
    const initCfg = instance;
    const old = app.instances.find((inst) => inst.uid === instance.uid);
    if (old) {
      //return old;
      old.cancel();
      app.instances = app.instances.filter(it => it.uid !== instance.uid);
    }

    const sizes = computeSizes(
      instance.config.resolution,
      instance.config.size,
      instance.config
    );

    const canvas = createCanvas(sizes.resolution, sizes.size);

    const container = instance.config.container || cfg.container;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("unable to get context");

    
    const tooltip: XElement<VisdTooltipProps, VisdTooltipProps> = Tooltip.call({ position: VEC2(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid }) as XElement<VisdTooltipProps, VisdTooltipProps>;


    const inst: ChartInstance = xReactive({
      ...instance,
      renderCount: 0,
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
        if (inst.xel.el) {
          inst.xel.el.remove();
        }
        if (inst.tooltip.el) {
          inst.tooltip.el.remove();
        }
        inst.active = false;
        app.instances = app.instances.filter(x => x.uid !== inst.uid);
      },
      resume: () => {
        inst.active = true;
      },
      xel: (() => {
        const xel: XElement = X<{ instance: ChartInstance }>('div', {
          onMount(_self) {
            const old = app.instances.find((inst) => inst.uid === instance.uid);

            if (old) {
              old.renderCount = 0;
            } else {
              app.instances.push(inst);
            }

            if (initCfg.onMount) {
              initCfg.onMount(old || inst);
            }
          },
          render(_props, _state) {
            return X('div', { children: [ canvas, tooltip ] })
          }
        });

        return xel;
      })() 
    });


    return inst;
  };

  const charts = {
    donut: (data: ChartData, options: ChartOptions = defaultDonutOptions) => {
      return (instance: ChartInstance) => {
        donutChart(app, instance, data, options);
      }
    },
    line: (
      data: ChartData,
      options: ChartOptions = defaultLineChartOptions
    ) => {
      
      return lineChart(app, data, options);
    },
  };

  const request = (action: IAction) => {
    if (!action.instanceUid) return;
    if (!app.instances) return;
    const avail = app.instances.map(inst => inst.uid);
    if (!avail.includes(action.instanceUid)) {
      console.warn(`No such instance "${action.instanceUid}"`);
      console.log('Available:');
      console.log(avail);
      return;
    }
    app.actionQueue.push(action);
  }

  return { start, stop, insert, charts, visd: app, request };
};

// @ts-ignore
let vapp: VisdApplication | undefined = undefined | (window.vapp as VisdApplication);

export const VisdApp = (cfg: VisdConfig): VisdApplication => {
  if (vapp) return vapp;
  // @ts-ignore
  window.vapp = vapp = createApp(cfg);
  return vapp;
};
