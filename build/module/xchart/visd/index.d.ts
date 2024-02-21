import { ChartFunction, ChartInitFunction } from "../charts/types";
import { VisdTooltipProps } from "../components/tooltip/types";
import { Vector } from "../utils/vector";
import { XElement } from "xel/lib/xel";
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
export declare const VisdApp: (cfg: VisdConfig) => VisdApplication;
