import { fract, lerp } from "./etc";
import { hashf } from "./hash";
export const noise = (x) => {
    const id = Math.floor(x);
    let lv = fract(x);
    lv = lv * lv * (3.0 - 2.0 * lv);
    const a = hashf(id + 0);
    const b = hashf(id + 1);
    return lerp(a, b, lv);
};
