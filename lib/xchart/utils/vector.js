var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { lerp as mix, range } from '../utils/etc';
import { hexToUint32, nthByte } from '../utils/hash';
var Vector = /** @class */ (function () {
    function Vector(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._x = x;
        this._y = y;
        this._z = z;
    }
    Object.defineProperty(Vector.prototype, "x", {
        get: function () {
            return this._x || 0;
        },
        set: function (value) {
            this._x = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "y", {
        get: function () {
            return this._y || 0;
        },
        set: function (value) {
            this._y = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "z", {
        get: function () {
            return this._z || 0;
        },
        set: function (value) {
            this._z = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "xy", {
        get: function () {
            return [this.x, this.y];
        },
        enumerable: false,
        configurable: true
    });
    Vector.prototype.count = function () {
        if (typeof this._z === 'number')
            return 3;
        return 2;
    };
    Vector.prototype.luma = function () {
        return this.dot(VEC3(0.299, 0.587, 0.114));
    };
    Vector.prototype.scale = function (s) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(this.x * s, this.y * s);
            case 3: return VEC3(this.x * s, this.y * s, this.z * s);
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.add = function (b) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(this.x + b.x, this.y + b.y);
            case 3: return VEC3(this.x + b.x, this.y + b.y, this.z + b.z);
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.sub = function (b) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(this.x - b.x, this.y - b.y);
            case 3: return VEC3(this.x - b.x, this.y - b.y, this.z - b.z);
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.mul = function (b) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(this.x * b.x, this.y * b.y);
            case 3: return VEC3(this.x * b.x, this.y * b.y, this.z * b.z);
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.run = function (f) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(f(this.x), f(this.y));
            case 3: return VEC3(f(this.x), f(this.y), f(this.z));
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.fromHex = function (hex) {
        var val = hexToUint32(hex);
        var numbers = range(4).map(function (n) { return nthByte(val, n); }).reverse();
        return new (Vector.bind.apply(Vector, __spreadArray([void 0], numbers, false)))();
    };
    Vector.prototype.toRGB = function (precision) {
        if (precision === void 0) { precision = 3; }
        return "rgb(".concat(this.x.toFixed(precision), ", ").concat(this.y.toFixed(precision), ", ").concat(this.z.toFixed(precision), ")");
    };
    Vector.prototype.lerp = function (b, scale) {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(mix(this.x, b.x, scale), mix(this.y, b.y, scale));
            case 3: return VEC3(mix(this.x, b.x, scale), mix(this.y, b.y, scale), mix(this.z || 0, b.z || 0, scale));
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.distance = function (b) {
        return Math.sqrt(Math.pow(this.x - b.x, 2.0) + Math.pow(this.y - b.y, 2.0) + Math.pow(this.z - b.z, 2.0));
    };
    Vector.prototype.dot = function (b) {
        var dx = this.x * b.x;
        var dy = this.y * b.y;
        var dz = this.z * b.z;
        return dx + dy + dz;
    };
    Vector.prototype.clone = function () {
        var count = this.count();
        switch (count) {
            case 2: return VEC2(this.x, this.y);
            case 3: return VEC3(this.x, this.y, this.z);
            default: throw new Error("Vector has ".concat(count, " components"));
        }
    };
    Vector.prototype.unit = function () {
        var mag = this.mag();
        if (mag <= 0.000000001)
            return this.clone().scale(0);
        var invMag = 1.0 / mag;
        return this.scale(invMag);
    };
    Vector.prototype.mag = function () {
        return Math.sqrt(Math.pow(this.x || 0, 2.0) + Math.pow(this.y || 0, 2.0) + Math.pow(this.z || 0, 2.0));
    };
    Vector.prototype.str = function () {
        var count = this.count();
        switch (count) {
            case 2: return "".concat(this.x, " ").concat(this.y);
            case 3: return "".concat(this.x, " ").concat(this.y, " ").concat(this.z);
            default:
                {
                    throw new Error("Vector has ".concat(count, " components."));
                }
                ;
                break;
        }
    };
    Vector.prototype.toString = function () {
        return this.str();
    };
    return Vector;
}());
export { Vector };
export var VEC3 = function (x, y, z) { return new Vector(x, y, z); };
export var VEC2 = function (x, y) { return new Vector(x, y); };
//# sourceMappingURL=vector.js.map