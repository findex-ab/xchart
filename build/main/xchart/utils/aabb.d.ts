import { Vector } from "./vector";
export type AABB = {
    min: Vector;
    max: Vector;
};
export declare const aabbVSPoint2D: (bounds: AABB, point: Vector) => boolean;
