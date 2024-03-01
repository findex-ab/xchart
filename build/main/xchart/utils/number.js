"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padNumberLeft = void 0;
const etc_1 = require("./etc");
const padNumberLeft = (n, div) => {
    const numZeroes = Math.max(0, 1 - Math.floor(n / div));
    if (numZeroes <= 0 || n >= div)
        return `${n}`;
    const zeroes = (0, etc_1.range)(numZeroes).map(i => `0`).join('');
    return `${zeroes}${n}`;
};
exports.padNumberLeft = padNumberLeft;
