import { ColorStop } from "../types/colorStop";
import { Range, RangeScalar } from "../types/range";
import { Vector } from "../utils/vector";
import { ChartInstance, Visd } from "../visd";
export type ChartData = {
    values?: number[];
    dates?: Date[];
    labels?: string[];
    colors?: string[];
};
export type ChartAxis = {
    range?: Range | RangeScalar[];
    color?: string;
    font?: string;
    format?: (x: RangeScalar) => string;
    divisor?: number;
    ticks?: number;
};
export type ChartPoint = {
    p: Vector;
    index: number;
};
export type ChartAxisPoint = {
    p: Vector;
    value: number;
    label?: string;
    textWidth: number;
};
export type ComputedChartAxis = {
    points: ChartAxisPoint[];
    config: Partial<ChartAxis>;
    maxTextWidth: number;
};
export type ComputedMetrics = {
    padding: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    h: number;
    w: number;
    vh: number;
    vw: number;
    peak: number;
    mid: number;
    font: string;
};
export type ChartOptions = {
    padding?: number;
    autoFit?: boolean;
    fitContainer?: boolean;
    thick?: number;
    radius?: number;
    drawLabels?: boolean;
    drawPoints?: boolean;
    drawOnlyClosestPoint?: boolean;
    dynamicSizePoints?: boolean;
    pointColor?: string;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    colors?: string[];
    fillGradient?: ColorStop[];
    smoothPath?: boolean;
    fontSize?: number | string;
    callback?: (instance: ChartInstance, key: RangeScalar, value: number, index: number) => void;
};
export type ChartFunction = (instance: ChartInstance) => void;
export type ChartInitFunction = (data: ChartData, options: ChartOptions) => ChartFunction;
export type ChartUpdateFunction = (instance: ChartInstance) => void;
export type ChartSetupFunction = (app: Visd, data: ChartData, options?: ChartOptions) => ChartUpdateFunction;
export type ChartRunFunction = (app: Visd, instance: ChartInstance, data: ChartData, options?: ChartOptions) => void;
