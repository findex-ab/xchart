import { clamp } from "../utils/etc";
import { isString, isUndefined } from "./is";
import { VEC2, VEC3, Vector } from "./vector";

export type DrawOptions = {
  fill?: string | Vector;
  stroke?: string | Vector;
  text?: any;
  pos?: Vector;
  thick?: number;
  radius?: number;
  size?: Vector;
  start?: Vector;
  end?: Vector;
  fontFamily?: string;
  fontSize?: number;
}

const toColor = (v?: string | Vector) => {
  if (isUndefined(v)) return 'black';
  if (isString(v)) return v;

  const w = v.w;
  const scaled = v.scale(255);
  scaled.w = w;
  return scaled.toRGB();
}

const setStyle = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  if (args.fill) { ctx.fillStyle = toColor(args.fill); }
  if (args.stroke) { ctx.strokeStyle = toColor(args.stroke); }
  if (args.thick) { ctx.lineWidth = args.thick };

  if (args.text) {
    const fontSize = args.fontSize || 16;
    const fontFamily = args.fontFamily || 'sans-serif';
    const font = `${fontSize}px ${fontFamily}`;
    ctx.font = font;
  }
}

const fillOrStroke = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  if (args.fill) { ctx.fill(); }
  if (args.stroke) { ctx.stroke(); }
}


const contained = (ctx: CanvasRenderingContext2D, args: DrawOptions, fun: Function) => {
  ctx.save();
  setStyle(ctx, args);
  fun();
  fillOrStroke(ctx, args);
  ctx.restore();
}



export const drawPoint = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  const pos = args.pos || VEC2(0, 0);
  contained(ctx, args, () => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, args.radius || 10, 0, Math.PI * 2);
    ctx.closePath();
  })
}

export const drawLine = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  const a = args.start || VEC2(0, 0);
  const b = args.end || VEC2(1, 1);
  contained(ctx, args, () => {
    ctx.beginPath();
    ctx.moveTo(...a.xy);
    ctx.lineTo(...b.xy);
    ctx.closePath();
  })
}

export const drawRect = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  const pos = args.pos || VEC2(0, 0);
  const size = args.size || VEC2(16, 16);
  contained(ctx, args, () => {
    ctx.beginPath();
    ctx.rect(pos.x, pos.y, size.x, size.y);
    ctx.closePath();
  })
}

export const drawText = (ctx: CanvasRenderingContext2D, args: DrawOptions) => {
  const pos = args.pos || VEC2(0, 0);
  
  const fun = (args.stroke ? ctx.strokeText : ctx.fillText).bind(ctx);
  contained(ctx, args, () => {
    ctx.beginPath();
    fun(`${args.text ?? ''}`, pos.x, pos.y);
    ctx.closePath();
  })
}

export const getPixel = (ctx: CanvasRenderingContext2D, pos: Vector) => {
  const x = clamp(pos.x, 0, ctx.canvas.width);
  const y = clamp(pos.y, 0, ctx.canvas.height);
  const data = ctx.getImageData(x, y, 1, 1).data;
  return VEC3(data[0], data[1], data[2]);
}
