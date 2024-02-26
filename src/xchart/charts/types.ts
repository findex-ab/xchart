import { Range, RangeScalar } from "../types/range";
import { ChartInstance, Visd } from "../visd";

export type ChartData = {
  values: number[];
  labels?: string[];
  colors?: string[];
};

export type ChartAxis = {
  range: Range;
  format?: (x: RangeScalar) => string;
}

export type ChartOptions = {
  padding?: number;
  autoFit?: boolean;
  fitContainer?: boolean;
  thick?: number;
  radius?: number;
  drawLabels?: boolean;
  drawPoints?: boolean;
  xAxis?: ChartAxis;
  colors?: string[];
  smoothPath?: boolean;
  fontSize?: number | string;
  callback?: (instance: ChartInstance, value: number, index: number) => void;
};

export type ChartFunction = (instance: ChartInstance) => void;
export type ChartInitFunction = (
  data: ChartData,
  options: ChartOptions,
) => ChartFunction;

export type ChartRunFunction = (
  app: Visd,
  instance: ChartInstance,
  data: ChartData,
  options?: ChartOptions,
) => void;
