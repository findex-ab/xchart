"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rangeToArray = void 0;
const fns = __importStar(require("date-fns"));
const date_1 = require("../utils/date");
const is_1 = require("../utils/is");
const etc_1 = require("../utils/etc");
const rangeToArray = (r) => {
    if (Array.isArray(r))
        return r.sort((a, b) => fns.compareAsc(a, b));
    if (r.array)
        return r.array.sort((a, b) => {
            return fns.compareAsc(a, b);
        });
    const a = r.start;
    const b = r.end;
    if ((0, date_1.isDate)(a) && (0, date_1.isDate)(b)) {
        //return fns.eachMonthOfInterval({start: a, end: b})
        return (0, date_1.getDatesBetween)(a, b, r.step);
    }
    if ((0, is_1.isNumber)(a) && (0, is_1.isNumber)(b)) {
        if (r.step) {
            const len = Math.abs(b - a) / r.step;
            return (0, etc_1.range)(len).map(i => (i * r.step));
        }
        else {
            const len = Math.abs(b - a);
            return (0, etc_1.range)(len).map(i => i + a);
        }
    }
    throw new Error('range start and end must be of same type');
};
exports.rangeToArray = rangeToArray;
