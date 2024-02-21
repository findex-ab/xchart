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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3hjaGFydC91dGlscy92ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQWtEO0FBQ2xELHdDQUFxRDtBQVFyRCxNQUFhLE1BQU07SUFLakIsWUFDRSxJQUFZLENBQUMsRUFDYixJQUFZLENBQUMsRUFDYixDQUFVO1FBUFosT0FBRSxHQUFXLENBQUMsQ0FBQztRQUNmLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFDZixPQUFFLEdBQVksQ0FBQyxDQUFDO1FBT2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksRUFBRTtRQUNKLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNsQixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNsQixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsS0FBYTtRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNsQixD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