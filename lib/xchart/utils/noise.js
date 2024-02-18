import { fract, lerp } from "./etc";
import { hashf } from "./hash";
export var noise = function (x) {
    var id = Math.floor(x);
    var lv = fract(x);
    lv = lv * lv * (3.0 - 2.0 * lv);
    var a = hashf(id + 0);
    var b = hashf(id + 1);
    return lerp(a, b, lv);
};
//# sourceMappingURL=noise.js.map