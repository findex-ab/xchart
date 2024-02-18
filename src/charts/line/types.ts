export type LineChartOptions = {
  padding?: number;
  colors?: string[];
  callback?: (value: number) => void
}

export const defaultLineChartOptions: LineChartOptions = {
  padding: 0,
  colors: ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6']
};

export type LineChartState = {
};
