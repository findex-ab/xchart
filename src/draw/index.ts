import { Visd } from "@/visd";
import { TAU } from "@/constants";
import { VEC2, Vector } from "@/utils/vector";

export type DrawArgs = {
  pos?: Vector;
  fill?: Vector;
  stroke?: Vector;
  radius?: number;
  thick?: number;
  size?: Vector;
  fraction?: number;
  fontSize?: string;
  fontFamily?: string;
  centered?: boolean;
}

export const beginDraw = (app: Visd, args: DrawArgs) => {
  const { ctx } = app;
  ctx.save();
  ctx.lineWidth = args.thick || 1;
  ctx.fillStyle = args.fill?.scale(255.0).toRGB(3) || '';
  ctx.strokeStyle = args.stroke?.scale(255.0).toRGB(3) || '';
}

export const endDraw = (app: Visd, args: DrawArgs) => {
  const { ctx } = app;
  if (args.fill) {
    ctx.strokeStyle = '';
    ctx.fill();
  } else if (args.stroke) {
    ctx.fillStyle = '';
    ctx.stroke();
  }

  ctx.restore();
}

export const drawRect = (app: Visd, args: DrawArgs) => {
  const { ctx } = app;
  const { pos, size } = args;
  beginDraw(app, args);
  ctx.fillRect(pos.x || 0, pos.y || 0, size.x || 0, size.y || 0);
  ctx.closePath();
  endDraw(app, args);
}

const drawText_ = (app: Visd, args: DrawArgs, text: string, onlyMeasure?: boolean): TextMetrics => {
  const { ctx } = app;
  const { pos, size } = args;
  beginDraw(app, args);
  ctx.beginPath();
  ctx.font = `${args.fontSize || 24}px ${args.fontFamily || 'Sans-Serif'}`;

  const m = ctx.measureText(text);
  if (!onlyMeasure) { ctx.fillText(text, pos.x, pos.y); }
  ctx.closePath();
  endDraw(app, args);
  return m;
}

export const drawText = (app: Visd, args: DrawArgs, text: string, onlyMeasure?: boolean): TextMetrics => {
  const m = drawText_(app, args, text, true);

  const pos = args.pos || VEC2(0, 0);

  if (args.centered) {
    pos.x -= m.width * 0.5;
    pos.y += m.actualBoundingBoxAscent*0.5;
  }

  args.pos = pos;
  
  drawText_(app, args, text, false);
  
  return m;
}

export const clearScreen = (app: Visd) => {
  const { ctx } = app;
  ctx.clearRect(0, 0, ...app.size.xy);
}
