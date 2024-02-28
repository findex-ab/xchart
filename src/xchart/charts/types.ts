import { Range, RangeScalar } from "../types/range";
import { ChartInstance, Visd } from "../visd";

export type ChartData = {
  values: number[];
  labels?: string[];
  colors?: string[];
};

export type ChartAxis = {
  range: Range;
  color?: string;
  font?: string;
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
  drawOnlyClosestPoint?: boolean;
  dynamicSizePoints?: boolean;
  pointColor?: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
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


export type ChartUpdateFunction = (instance: ChartInstance) => void;

export type ChartSetupFunction = (
  app: Visd,
  data: ChartData,
  options?: ChartOptions,
) => ChartUpdateFunction;

export type ChartRunFunction = (
  app: Visd,
  instance: ChartInstance,
  data: ChartData,
  options?: ChartOptions,
) => void;
