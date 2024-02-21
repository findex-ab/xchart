"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nthByte = exports.hexToUint32 = exports.toUint32 = exports.floatBitsToUint = exports.hash21f = exports.hashf = exports.hashu32 = void 0;
const is_1 = require("../utils/is");
const hashu32 = (i) => {
    i = (0, exports.toUint32)(i);
    const s = ((i >> 3) * 12);
    const k = ~i + ~s;
    i ^= i << 17;
    i ^= i >> 13;
    i ^= i << 5;
    i += (i ^ k) + i * k;
    i *= 1013;
    i ^= (i >> 4);
    return (0, exports.toUint32)(i * k + i + i * k + k);
};
exports.hashu32 = hashu32;
const hashf = (i) => {
    return (0, exports.hashu32)(i) / (0, exports.toUint32)(0xFFFFFFFF);
};
exports.hashf = hashf;
const hash21f = (ix, iy, is = 1.98472) => {
    let x = (0, exports.toUint32)(ix);
    let y = (0, exports.toUint32)(iy);
    const s = (0, exports.toUint32)(is);
    const kx = ~x;
    const ky = ~y;
    x = (0, exports.hashu32)(x + s * 13);
    y = (0, exports.hashu32)(y + s * 13);
    return (0, exports.toUint32)(x * 5013 + y * 1013 + (ky * 5013 + kx * 1013)) / 0xffffffff;
};
exports.hash21f = hash21f;
const floatBitsToUint = (f) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, f);
    return view.getUint32(0);
};
exports.floatBitsToUint = floatBitsToUint;
const toUint32 = (f) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, (0, is_1.isFloat)(f) ? (0, exports.floatBitsToUint)(f) : f);
    return view.getUint32(0);
};
exports.toUint32 = toUint32;
const hexToUint32 = (hex) => {
    let stringValue = hex.replace('#', '').replace('0x', '');
    stringValue = stringValue.length < 8 ? `${stringValue}FF` : stringValue;
    stringValue = `0x${stringValue}`;
    return (0, exports.toUint32)(parseInt(stringValue, 16));
};
exports.hexToUint32 = hexToUint32;
const nthByte = (val, n) => {
    return (val >> (n * 8)) & 0xFF;
};
exports.nthByte = nthByte;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy94Y2hhcnQvdXRpbHMvaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvQ0FBc0M7QUFFL0IsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRTtJQUNuQyxDQUFDLEdBQUcsSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0MsT0FBTyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUV6QyxDQUFDLENBQUE7QUFQWSxRQUFBLE9BQU8sV0FPbkI7QUFFTSxNQUFNLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFO0lBQ3pDLE9BQU8sSUFBQSxlQUFPLEVBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBQSxnQkFBUSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLENBQUMsQ0FBQTtBQUZZLFFBQUEsS0FBSyxTQUVqQjtBQUVNLE1BQU0sT0FBTyxHQUFHLENBQUMsRUFBVSxFQUFFLEVB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