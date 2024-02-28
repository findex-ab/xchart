"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEC2 = exports.VEC3 = exports.Vector = void 0;
const etc_1 = require("../utils/etc");
const hash_1 = require("../utils/hash");
class Vector {
    constructor(x = 0, y = 0, z) {
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._x = x;
        this._y = y;
        this._z = z;
    }
    get x() {
        return this._x || 0;
    }
    get y() {
        return this._y || 0;
    }
    get z() {
        return this._z || 0;
    }
    get xy() {
        return [this.x, this.y];
    }
    set x(value) {
        this._x = value;
    }
    set y(value) {
        this._y = value;
    }
    set z(value) {
        this._z = value;
    }
    count() {
        if (typeof this._z === 'number')
            return 3;
        return 2;
    }
    luma() {
        return this.dot((0, exports.VEC3)(0.299, 0.587, 0.114));
    }
    scale(s) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(this.x * s, this.y * s);
            case 3: return (0, exports.VEC3)(this.x * s, this.y * s, this.z * s);
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    add(b) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(this.x + b.x, this.y + b.y);
            case 3: return (0, exports.VEC3)(this.x + b.x, this.y + b.y, this.z + b.z);
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    sub(b) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(this.x - b.x, this.y - b.y);
            case 3: return (0, exports.VEC3)(this.x - b.x, this.y - b.y, this.z - b.z);
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    mul(b) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(this.x * b.x, this.y * b.y);
            case 3: return (0, exports.VEC3)(this.x * b.x, this.y * b.y, this.z * b.z);
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    run(f) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(f(this.x), f(this.y));
            case 3: return (0, exports.VEC3)(f(this.x), f(this.y), f(this.z));
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    static fromHex(hex) {
        const val = (0, hash_1.hexToUint32)(hex);
        const numbers = (0, etc_1.range)(4).map(n => (0, hash_1.nthByte)(val, n)).reverse();
        return new Vector(...numbers);
    }
    toRGB(precision = 3) {
        return `rgb(${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.z.toFixed(precision)})`;
    }
    lerp(b, scale) {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)((0, etc_1.lerp)(this.x, b.x, scale), (0, etc_1.lerp)(this.y, b.y, scale));
            case 3: return (0, exports.VEC3)((0, etc_1.lerp)(this.x, b.x, scale), (0, etc_1.lerp)(this.y, b.y, scale), (0, etc_1.lerp)(this.z || 0, b.z || 0, scale));
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    distance(b) {
        return Math.sqrt(Math.pow(this.x - b.x, 2.0) + Math.pow(this.y - b.y, 2.0) + Math.pow(this.z - b.z, 2.0));
    }
    dot(b) {
        const dx = this.x * b.x;
        const dy = this.y * b.y;
        const dz = this.z * b.z;
        return dx + dy + dz;
    }
    clone() {
        const count = this.count();
        switch (count) {
            case 2: return (0, exports.VEC2)(this.x, this.y);
            case 3: return (0, exports.VEC3)(this.x, this.y, this.z);
            default: throw new Error(`Vector has ${count} components`);
        }
    }
    unit() {
        const mag = this.mag();
        if (mag <= 0.000000001)
            return this.clone().scale(0);
        const invMag = 1.0 / mag;
        return this.scale(invMag);
    }
    mag() {
        return Math.sqrt(Math.pow(this.x || 0, 2.0) + Math.pow(this.y || 0, 2.0) + Math.pow(this.z || 0, 2.0));
    }
    str() {
        const count = this.count();
        switch (count) {
            case 2: return `${this.x} ${this.y}`;
            case 3: return `${this.x} ${this.y} ${this.z}`;
            default:
                {
                    throw new Error(`Vector has ${count} components.`);
                }
                ;
                break;
        }
    }
    toString() {
        return this.str();
    }
}
exports.Vector = Vector;
const VEC3 = (x, y, z) => new Vector(x, y, z);
exports.VEC3 = VEC3;
const VEC2 = (x, y) => new Vector(x, y);
exports.VEC2 = VEC2;
