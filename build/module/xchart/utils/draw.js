import { isString, isUndefined } from "./is";
import { VEC2 } from "./vector";
const toColor = (v) => {
    if (isUndefined(v))
        return 'black';
    if (isString(v))
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
export const drawPoint = (ctx, args) => {
    const pos = args.pos || VEC2(0, 0);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, args.radius || 10, 0, Math.PI * 2);
        ctx.closePath();
    });
};
export const drawLine = (ctx, args) => {
    const a = args.start || VEC2(0, 0);
    const b = args.end || VEC2(1, 1);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.moveTo(...a.xy);
        ctx.lineTo(...b.xy);
        ctx.closePath();
    });
};
export const drawRect = (ctx, args) => {
    const pos = args.pos || VEC2(0, 0);
    const size = args.size || VEC2(16, 16);
    contained(ctx, args, () => {
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, size.x, size.y);
        ctx.closePath();
    });
};
export const drawText = (ctx, args) => {
    const pos = args.pos || VEC2(0, 0);
    const fun = (args.stroke ? ctx.strokeText : ctx.fillText).bind(ctx);
    contained(ctx, args, () => {
        ctx.beginPath();
        fun(`${args.text ?? ''}`, pos.x, pos.y);
        ctx.closePath();
    });
};
