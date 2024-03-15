export declare const chunkify: <T = any>(arr: T[], sliceSize?: number) => [T[]];
export declare const stepForEach: <T = any>(arr: T[], sliceSize: number, fun: (it: T[]) => void) => void;
export declare const uniqueBy: <T, KV = string>(arr: T[], key: string | ((item: T) => KV)) => T[];
export declare const unique: <T>(arr: T[]) => T[];
export declare const removeItemAtIndex: <T = any>(array: T[], index: number) => T[];
export declare const isAllSame: <T = any>(arr: T[]) => boolean;
