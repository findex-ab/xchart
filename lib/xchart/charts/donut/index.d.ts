import { Visd } from "../../visd";
import { Vector } from "../../utils/vector";
import { DonutChartState, DonutOptions, DonutSegment } from "./types";
import { ChartData } from "../types";
export declare const donutChart: (app: Visd, center: Vector, data: ChartData, options?: DonutOptions, callback?: (segment: DonutSegment) => void) => DonutChartState;
