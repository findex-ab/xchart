export type RangeScalar = Date | number | string;
export type Range = {
    start?: RangeScalar;
    end?: RangeScalar;
    step?: number;
    array?: RangeScalar[];
};
export declare const rangeToArray: (r: Range | RangeScalar[]) => any[];
