"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawText = exports.drawRect = exports.drawLine = exports.drawPoint = void 0;
const is_1 = require("./is");
const vector_1 = require("./vector");
const toColor = (v) => {
    if ((0, is_1.isUndefined)(v))
        return 'black';
    if ((0, is_1.isString)(v))
        return v;
    const w = v.w;
    const scaled = v.scale(255);
    scaled.w = w;
    return scaled.toRGB();
};
const setStyle = (ctx, args) => {
    if (args.fill) {
        ctx.fillStyle = toColor(args.fill);
    }
    if (args.stroke) {
        ctx.strokeStyle = toColor(args.stroke);
    }
    if (args.thick) {
        ctx.lineWidth = args.thick;
    }
    ;
    if (args.text) {
        const fontSize = args.fontSize || 16;
        const fontFamily = args.fontFamily || 'sans-serif';
        const font = `${fontSize}px ${fontFamily}`;
        ctx.font = font;
    }
};
const fillOrStroke = (ctx, args) => {
    if (args.fill) {
        ctx.fill();
    }
    if (args.stroke) {
        ctx.stroke();
    }
};
const contained = (ctx, args, fun) => {
    ctx.save();
    setStyle(ctx, args);
    fun();
    fillOrStroke(ctx, args);
    ctx.restore();
};
const drawPoint = (ctx, args) => {
    const pos = args.pos || (0, vector_1.VEC2)(0, 0);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, args.radius || 10, 0, Math.PI * 2);
        ctx.closePath();
    });
};
exports.drawPoint = drawPoint;
const drawLine = (ctx, args) => {
    const a = args.start || (0, vector_1.VEC2)(0, 0);
    const b = args.end || (0, vector_1.VEC2)(1, 1);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.moveTo(...a.xy);
        ctx.lineTo(...b.xy);
        ctx.closePath();
    });
};
exports.drawLine = drawLine;
const drawRect = (ctx, args) => {
    const pos = args.pos || (0, vector_1.VEC2)(0, 0);
    const size = args.size || (0, vector_1.VEC2)(16, 16);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, size.x, size.y);
        ctx.closePath();
    });
};
exports.drawRect = drawRect;
const drawText = (ctx, args) => {
    const pos = args.pos || (0, vector_1.VEC2)(0, 0);
    const fun = (args.stroke ? ctx.strokeText : ctx.fillText).bind(ctx);
    contained(ctx, args, () => {
        var _a;
        ctx.beginPath();
        fun(`${(_a = args.text) !== null && _a !== void 0 ? _a : ''}`, pos.x, pos.y);
        ctx.closePath();
    });
};
exports.drawText = drawText;
