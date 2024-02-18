import { Visd } from "../visd";
import { Vector } from "../utils/vector";
export type DrawArgs = {
    pos?: Vector;
    fill?: Vector;
    stroke?: Vector;
    radius?: number;
    thick?: number;
    size?: Vector;
    fraction?: number;
    fontSize?: string;
    fontFamily?: string;
    centered?: boolean;
};
export declare const beginDraw: (app: Visd, args: DrawArgs) => void;
export declare const endDraw: (app: Visd, args: DrawArgs) => void;
export declare const drawRect: (app: Visd, args: DrawArgs) => void;
export declare const drawText: (app: Visd, args: DrawArgs, text: string, onlyMeasure?: boolean) => TextMetrics;
export declare const clearScreen: (app: Visd) => void;
