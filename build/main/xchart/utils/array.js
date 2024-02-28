"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepForEach = exports.chunkify = void 0;
const chunkify = (arr, sliceSize = 2) => {
    const result = [[]];
    for (let i = 0; i < arr.length; i += sliceSize) {
        const slice = [...arr].splice(i, sliceSize);
        result.push(slice);
    }
    return result;
};
exports.chunkify = chunkify;
const stepForEach = (arr, sliceSize, fun) => {
    for (let i = 0; i < arr.length; i += sliceSize) {
        const slice = [...arr].splice(i, sliceSize);
        fun(slice);
    }
};
exports.stepForEach = stepForEach;
