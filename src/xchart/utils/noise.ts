import { clamp, fract, lerp } from "./etc";
import { hashf } from "./hash";

export const noise = (x: number) => {
  const id = Math.floor(x);
  let lv = fract(x);
  lv = lv * lv * (3.0 - 2.0 * lv);
  const a = hashf(id + 0);
  const b = hashf(id + 1);
  return  clamp(lerp(a, b, lv), 0, 1);
}
