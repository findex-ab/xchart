import { Visd } from '../../visd';
import { ChartData, ChartOptions, ComputedChartAxis, ComputedMetrics } from '../types';
export declare const computeYAxis: (app: Visd, data: ChartData, values_: number[], ctx: CanvasRenderingContext2D, options: ChartOptions, metrics: ComputedMetrics) => ComputedChartAxis;
export declare const computeXAxis: (app: Visd, data: ChartData, ctx: CanvasRenderingContext2D, options: ChartOptions, metrics: ComputedMetrics) => ComputedChartAxis;
