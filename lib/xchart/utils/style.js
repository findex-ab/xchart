export var remToPx = function (rem) { return rem * parseFloat(getComputedStyle(document.documentElement).fontSize); };
export var pxToRem = function (px) { return px / parseFloat(getComputedStyle(document.documentElement).fontSize); };
export var pxToRemStr = function (px) { return "".concat(pxToRem(px), "rem"); };
//# sourceMappingURL=style.js.map