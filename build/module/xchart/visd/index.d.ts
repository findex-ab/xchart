import { ChartFunction, ChartInitFunction } from "../charts/types";
import { VisdTooltipProps } from "../components/tooltip/types";
import { Vector } from "../utils/vector";
import { XElement } from "xel";
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
    sizeClamp?: {
        min: Vector;
        max: Vector;
    };
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
    deltaTime: number;
    lastTime: number;
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
export declare const VisdApp: (cfg: VisdConfig) => VisdApplication;
