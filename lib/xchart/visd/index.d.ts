import { DonutOptions, DonutSegment } from "../charts/donut/types";
import { LineChartOptions } from "../charts/line/types";
import { ChartData, ChartFunction } from "../charts/types";
import { Vector } from "../utils/vector";
import { XElement } from "xel";
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
    size?: Vector;
    scale?: number;
    container?: Element;
    shadowBlur?: number;
    shadowAlpha?: number;
    middleDisplay?: XElement;
}
export declare const VisdApp: (cfg: VisdConfig) => {
    start: (fun: ChartFunction) => void;
    charts: {
        donut: (data: ChartData, options: DonutOptions, callback: (segment: DonutSegment) => void) => () => import("../charts/donut/types").DonutChartState;
        line: (data: ChartData, options?: LineChartOptions) => () => import("../charts/line/types").LineChartState;
    };
    setTooltipBody: (body: XElement) => void;
    canvas: HTMLCanvasElement;
};
export declare const VisdApp__backup: (cfg: VisdConfig) => {
    start: (fun: ChartFunction) => void;
    stop: () => void;
    charts: {
        donut: (data: ChartData, options: DonutOptions, callback: (segment: DonutSegment) => void) => () => import("../charts/donut/types").DonutChartState;
        line: (data: ChartData, options?: LineChartOptions) => () => import("../charts/line/types").LineChartState;
    };
    setTooltipBody: (body: XElement) => void;
};
