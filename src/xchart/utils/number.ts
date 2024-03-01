import { range } from "./etc";

export const padNumberLeft = (n: number, div: number): string => {
  const numZeroes = Math.max(0, 1 - Math.floor(n / div));
  if (numZeroes <= 0 || n >= div) return `${n}`;
  const zeroes = range(numZeroes).map(i => `0`).join('');
  return `${zeroes}${n}`;
}
