import { donutChart } from "@/charts/donut";
import { DonutOptions, DonutSegment } from "@/charts/donut/types";
import { lineChart } from "@/charts/line";
import { LineChartOptions, defaultLineChartOptions } from "@/charts/line/types";
import { ChartData, ChartFunction } from "@/charts/types";
import { Tooltip } from "@/components/tooltip";
import { VisdTooltipProps } from "@/components/tooltip/types";
import { clearScreen } from "@/draw";
import { range } from "@/utils/etc";
import { hashf } from "@/utils/hash";
import { VEC2, Vector } from "@/utils/vector";
import { X, XElement, mount } from "xel";

export interface Visd {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: Vector;
  time: number;
  mouse: Vector;
  chartFunction: ChartFunction;
  loopId: number;
}

export interface VisdConfig {
  resolution: Vector;
  container?: Element;
}

export const VisdApp = (cfg: VisdConfig) => {
  const { resolution, container } = cfg;

  resolution.x = resolution.x || 500;
  resolution.y = resolution.y || 500;
  const ratio = window.devicePixelRatio;
  const dpiRes = resolution.scale(ratio);

  const createCanvas = (size: Vector): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.setAttribute(
      "style",
      `width: ${resolution.x}px; height: ${resolution.y}px;`
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
    loopId: -1
  };

  const tooltip = Tooltip;



  const update = (visd: Visd) => {
    const { ctx, size } = visd;
    clearScreen(visd);
    const center = size.scale(0.5);

    app.chartFunction();
   // donutChart(visd, center, data.values, ctx);
  };

  const loop = (time: number, visd: Visd) => {
    visd.time = time;
    update(visd);
    app.loopId = requestAnimationFrame((time: number) => loop(time, visd));
  };


  const stop = () => {
    if (app.loopId >= 0) {
      cancelAnimationFrame(app.loopId);
      app.loopId = -1;
    }
  }

  const start = (fun: ChartFunction) => {

    let mounted = false;
    
    if (container) {
      container.appendChild(canvas);
    }

    window.addEventListener("mousemove", (e):void => {
      const rect = canvas.getBoundingClientRect();
      app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y).scale(ratio);

      if (!mounted) {
        tooltip.el = undefined;
        mount(tooltip, { target: container });
        mounted = true;
      }

      tooltip.state.position = VEC2(e.x, e.y);
    });

    app.chartFunction = fun;
    
    loop(0, app);
  };

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
