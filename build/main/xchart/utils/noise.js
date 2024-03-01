"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noise = void 0;
const etc_1 = require("./etc");
const hash_1 = require("./hash");
const noise = (x) => {
    const id = Math.floor(x);
    let lv = (0, etc_1.fract)(x);
    lv = lv * lv * (3.0 - 2.0 * lv);
    const a = (0, hash_1.hashf)(id + 0);
    const b = (0, hash_1.hashf)(id + 1);
    return (0, etc_1.clamp)((0, etc_1.lerp)(a, b, lv), 0, 1);
};
exports.noise = noise;
