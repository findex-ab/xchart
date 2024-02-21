"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pxToRemStr = exports.pxToRem = exports.remToPx = void 0;
const remToPx = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
exports.remToPx = remToPx;
const pxToRem = (px) => px / parseFloat(getComputedStyle(document.documentElement).fontSize);
exports.pxToRem = pxToRem;
const pxToRemStr = (px) => `${(0, exports.pxToRem)(px)}rem`;
exports.pxToRemStr = pxToRemStr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3V0aWxzL3N0eWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUFqRyxRQUFBLE9BQU8sV0FBMEY7QUFDdkcsTUFBTSxPQUFPLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQS9GLFFBQUEsT0FBTyxXQUF3RjtBQUNyRyxNQUFNLFVBQVUsR0FBRyxDQUFDLEVBQVUsRUFBUyxFQUFFLENBQUMsR0FBRyxJQUFBLGVBQU8sRUFBQyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQXhELFFBQUEsVUFBVSxjQUE4QyJ9