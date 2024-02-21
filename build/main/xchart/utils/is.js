"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumerical = exports.isDigit = exports.isUndefined = exports.isFactor = exports.isBoolean = exports.isString = exports.isFloat = exports.isNumber = void 0;
const isNumber = (x) => typeof x === 'number';
exports.isNumber = isNumber;
const isFloat = (x) => (0, exports.isNumber)(x) && x.toString().includes('.');
exports.isFloat = isFloat;
const isString = (x) => typeof x === 'string';
exports.isString = isString;
const isBoolean = (x) => typeof x === 'boolean';
exports.isBoolean = isBoolean;
const isFactor = (x) => (0, exports.isNumber)(x) || (0, exports.isString)(x) || (0, exports.isBoolean)(x);
exports.isFactor = isFactor;
const isUndefined = (x) => (typeof x === 'undefined');
exports.isUndefined = isUndefined;
const isDigit = (c) => {
    if ((0, exports.isUndefined)(c) || c === null)
        return false;
    const n = c.codePointAt(0) || 0;
    return n >= 48 && n <= 57;
};
exports.isDigit = isDigit;
const isNumerical = (c) => {
    const digits = Array.from(c).filter(exports.isDigit);
    return digits.length >= c.length;
};
exports.isNumerical = isNumerical;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3V0aWxzL2lzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUM7QUFBMUQsUUFBQSxRQUFRLFlBQWtEO0FBQ2hFLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBTSxFQUFlLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUE3RSxRQUFBLE9BQU8sV0FBc0U7QUFDbkYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQztBQUExRCxRQUFBLFFBQVEsWUFBa0Q7QUFDaEUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFNLEVBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxTQUFTLENBQUM7QUFBN0QsUUFBQSxTQUFTLGFBQW9EO0FBQ25FLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUF5QyxFQUFFLENBQUMsSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxJQUFJLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxJQUFBLGlCQUFTLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFBekcsUUFBQSxRQUFRLFlBQWlHO0FBQy9HLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBTyxFQUFrQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQztBQUF0RSxRQUFBLFdBQVcsZUFBMkQ7QUFDNUUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFTLEVBQVcsRUFBRTtJQUM1QyxJQUFJLElBQUEsbUJBQVcsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzVCLENBQUMsQ0FBQTtBQUpZLFFBQUEsT0FBTyxXQUluQjtBQUVNLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBUyxFQUFXLEVBQUU7SUFDaEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBTyxDQUFDLENBQUM7SUFDN0MsT0FBTyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDbkMsQ0FBQyxDQUFBO0FBSFksUUFBQSxXQUFXLGVBR3ZCIn0=