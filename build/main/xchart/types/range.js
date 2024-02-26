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
    const a = r.start;
    const b = r.end;
    if (fns.isDate(a) && fns.isDate(b)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3R5cGVzL3JhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBQWdDO0FBQ2hDLHdDQUFnRDtBQUNoRCxvQ0FBdUM7QUFDdkMsc0NBQXFDO0FBWTlCLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBUSxFQUFFLEVBQUU7SUFDdkMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNsQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBRWhCLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkMsT0FBTyxJQUFBLHNCQUFlLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksSUFBQSxhQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksSUFBQSxhQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDckMsT0FBTyxJQUFBLFdBQUssRUFBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sSUFBQSxXQUFLLEVBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzlELENBQUMsQ0FBQTtBQW5CWSxRQUFBLFlBQVksZ0JBbUJ4QiJ9