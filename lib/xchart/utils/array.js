var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var chunkify = function (arr, sliceSize) {
    if (sliceSize === void 0) { sliceSize = 2; }
    var result = [[]];
    for (var i = 0; i < arr.length; i += sliceSize) {
        var slice = __spreadArray([], arr, true).splice(i, sliceSize);
        result.push(slice);
    }
    return result;
};
export var stepForEach = function (arr, sliceSize, fun) {
    for (var i = 0; i < arr.length; i += sliceSize) {
        var slice = __spreadArray([], arr, true).splice(i, sliceSize);
        fun(slice);
    }
};
//# sourceMappingURL=array.js.map