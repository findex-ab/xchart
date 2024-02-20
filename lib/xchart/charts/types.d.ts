import { InternalChartInstance, Visd } from "../visd";
export type ChartData = {
    values: number[];
    labels?: string[];
    colors?: string[];
};
export type ChartOptions = {
    padding?: number;
    autoFit?: boolean;
    thick?: number;
    drawLabels?: boolean;
    colors?: string[];
    callback?: (instance: InternalChartInstance, value: number, index: number) => void;
};
export type ChartFunction = (instance: InternalChartInstance) => void;
export type ChartInitFunction = (data: ChartData, options: ChartOptions) => ChartFunction;
export type ChartRunFunction = (app: Visd, instance: InternalChartInstance, data: ChartData, options?: ChartOptions) => void;
