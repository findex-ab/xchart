import { Vector } from "../../utils/vector";

export type DonutSegment = {
  startAngle: number;
  endAngle: number;
  index: number;
  value: number;
  sliceAngle: number;
  textPercentage: string;
  pos: Vector;
  angle: number;
  middleAngle: number;
  fraction: number;
  color: string;
}

export type DonutOptions = {
  padding?: number;
  thick?: number;
}

export type DonutChartState = {
  activeSegment?: DonutSegment;
}

export const defaultDonutOptions: DonutOptions = { padding: 8.0 };
