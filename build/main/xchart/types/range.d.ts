export type RangeScalar = Date | number;
export type Range = {
    start: RangeScalar;
    end: RangeScalar;
    step?: number;
};
export declare const rangeToArray: (r: Range) => any[];
