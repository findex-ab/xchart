import * as fns from 'date-fns';
import { getDatesBetween, isDate } from '../utils/date';
import { isNumber } from '../utils/is';
import { range } from '../utils/etc';


export type RangeScalar = Date | number | string;


export type Range = {
  start: RangeScalar;
  end: RangeScalar;
  step?: number;
  array?: RangeScalar[]
}

export const rangeToArray = (r: Range | RangeScalar[]) => {
  if (Array.isArray(r)) return r.sort((a, b) => fns.compareAsc(a, b));
  if (r.array) return r.array.sort((a, b) => {
    return fns.compareAsc(a, b);
  });
  
  const a = r.start;
  const b = r.end;

  if (isDate(a) && isDate(b)) {
    //return fns.eachMonthOfInterval({start: a, end: b})
    return getDatesBetween(a, b, r.step);
  }

  if (isNumber(a) && isNumber(b)) {
    if (r.step) {
      const len = Math.abs(b - a) / r.step;
      return range(len).map(i => (i * r.step));
    } else {
      const len = Math.abs(b - a);
      return range(len).map(i => i + a);
    }
  }

  throw new Error('range start and end must be of same type');
}
