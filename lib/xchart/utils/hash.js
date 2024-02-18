import { isFloat } from '../utils/is';
export var hashu32 = function (i) {
    i = toUint32(i);
    var s = ((i >> 3) * 12);
    var k = ~i + ~s;
    i ^= i << 17;
    i ^= i >> 13;
    i ^= i << 5;
    i += (i ^ k) + i * k;
    i *= 1013;
    i ^= (i >> 4);
    return toUint32(i * k + i + i * k + k);
};
export var hashf = function (i) {
    return hashu32(i) / toUint32(0xFFFFFFFF);
};
export var hash21f = function (ix, iy, is) {
    if (is === void 0) { is = 1.98472; }
    var x = toUint32(ix);
    var y = toUint32(iy);
    var s = toUint32(is);
    var kx = ~x;
    var ky = ~y;
    x = hashu32(x + s * 13);
    y = hashu32(y + s * 13);
    return toUint32(x * 5013 + y * 1013 + (ky * 5013 + kx * 1013)) / 0xffffffff;
};
export var floatBitsToUint = function (f) {
    var buffer = new ArrayBuffer(4);
    var view = new DataView(buffer);
    view.setFloat32(0, f);
    return view.getUint32(0);
};
export var toUint32 = function (f) {
    var buffer = new ArrayBuffer(4);
    var view = new DataView(buffer);
    view.setUint32(0, isFloat(f) ? floatBitsToUint(f) : f);
    return view.getUint32(0);
};
export var hexToUint32 = function (hex) {
    var stringValue = hex.replace('#', '').replace('0x', '');
    stringValue = stringValue.length < 8 ? "".concat(stringValue, "FF") : stringValue;
    stringValue = "0x".concat(stringValue);
    return toUint32(parseInt(stringValue, 16));
};
export var nthByte = function (val, n) {
    return (val >> (n * 8)) & 0xFF;
};
//# sourceMappingURL=hash.js.map