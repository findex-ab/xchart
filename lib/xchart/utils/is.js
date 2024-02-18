export var isNumber = function (x) { return typeof x === 'number'; };
export var isFloat = function (x) { return isNumber(x) && x.toString().includes('.'); };
export var isString = function (x) { return typeof x === 'string'; };
export var isBoolean = function (x) { return typeof x === 'boolean'; };
export var isFactor = function (x) { return isNumber(x) || isString(x) || isBoolean(x); };
export var isUndefined = function (x) { return (typeof x === 'undefined'); };
export var isDigit = function (c) {
    if (isUndefined(c) || c === null)
        return false;
    var n = c.codePointAt(0) || 0;
    return n >= 48 && n <= 57;
};
export var isNumerical = function (c) {
    var digits = Array.from(c).filter(isDigit);
    return digits.length >= c.length;
};
//# sourceMappingURL=is.js.map