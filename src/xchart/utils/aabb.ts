import { Vector } from "./vector"

export type AABB = {
  min: Vector;
  max: Vector;
};


export const aabbVSPoint2D = (bounds: AABB, point: Vector) => {
  const { min, max } = bounds;
  if (point.x < min.x || point.x > max.x) return  false;
  if (point.y < min.y || point.y > max.y) return  false;
  return true;
}
