"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemAtIndex = exports.unique = exports.uniqueBy = exports.stepForEach = exports.chunkify = void 0;
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
const uniqueBy = (arr, key) => {
    const nextArr = [];
    try {
        const getId = (item, k) => {
            return typeof k === 'string' ? item[k] : k(item);
        };
        for (const item of arr) {
            const id = getId(item, key);
            const count = nextArr.filter((it) => getId(it, key) === id).length;
            if (count > 0)
                continue;
            nextArr.push(item);
        }
    }
    catch (e) {
        console.error('uniqueBy() failed.');
        console.error(e);
    }
    return nextArr;
};
exports.uniqueBy = uniqueBy;
const unique = (arr) => [...Array.from(new Set(arr))];
exports.unique = unique;
const removeItemAtIndex = (array, index) => {
    if (index > -1 && index < array.length) {
        array.splice(index, 1);
    }
    return array;
};
exports.removeItemAtIndex = removeItemAtIndex;
