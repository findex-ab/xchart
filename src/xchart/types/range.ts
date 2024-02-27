import * as fns from 'date-fns';
import { getDatesBetween } from '../utils/date';
import { isNumber } from '../utils/is';
import { range } from '../utils/etc';


export type RangeScalar = Date | number;


export type Range = {
  start: RangeScalar;
  end: RangeScalar;
  step?: number;
  array?: RangeScalar[]
}

export const rangeToArray = (r: Range) => {
  if (r.array) return r.array;
  
  const a = r.start;
  const b = r.end;

  if (fns.isDate(a) && fns.isDate(b)) {
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
