import { Vector } from "./vector";
export type DrawOptions = {
    fill?: string | Vector;
    stroke?: string | Vector;
    text?: any;
    pos?: Vector;
    thick?: number;
    radius?: number;
    size?: Vector;
    start?: Vector;
    end?: Vector;
    fontFamily?: string;
    fontSize?: number;
};
export declare const drawPoint: (ctx: CanvasRenderingContext2D, args: DrawOptions) => void;
export declare const drawLine: (ctx: CanvasRenderingContext2D, args: DrawOptions) => void;
export declare const drawRect: (ctx: CanvasRenderingContext2D, args: DrawOptions) => void;
export declare const drawText: (ctx: CanvasRenderingContext2D, args: DrawOptions) => void;
