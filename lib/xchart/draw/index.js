var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { VEC2 } from "../utils/vector";
export var beginDraw = function (app, args) {
    var _a, _b;
    var ctx = app.ctx;
    ctx.save();
    ctx.lineWidth = args.thick || 1;
    ctx.fillStyle = ((_a = args.fill) === null || _a === void 0 ? void 0 : _a.scale(255.0).toRGB(3)) || '';
    ctx.strokeStyle = ((_b = args.stroke) === null || _b === void 0 ? void 0 : _b.scale(255.0).toRGB(3)) || '';
};
export var endDraw = function (app, args) {
    var ctx = app.ctx;
    if (args.fill) {
        ctx.strokeStyle = '';
        ctx.fill();
    }
    else if (args.stroke) {
        ctx.fillStyle = '';
        ctx.stroke();
    }
    ctx.restore();
};
export var drawRect = function (app, args) {
    var ctx = app.ctx;
    var pos = args.pos, size = args.size;
    beginDraw(app, args);
    ctx.fillRect(pos.x || 0, pos.y || 0, size.x || 0, size.y || 0);
    ctx.closePath();
    endDraw(app, args);
};
var drawText_ = function (app, args, text, onlyMeasure) {
    var ctx = app.ctx;
    var pos = args.pos, size = args.size;
    beginDraw(app, args);
    ctx.beginPath();
    ctx.font = "".concat(args.fontSize || 24, "px ").concat(args.fontFamily || 'Sans-Serif');
    var m = ctx.measureText(text);
    if (!onlyMeasure) {
        ctx.fillText(text, pos.x, pos.y);
    }
    ctx.closePath();
    endDraw(app, args);
    return m;
};
export var drawText = function (app, args, text, onlyMeasure) {
    var m = drawText_(app, args, text, true);
    var pos = args.pos || VEC2(0, 0);
    if (args.centered) {
        pos.x -= m.width * 0.5;
        pos.y += m.actualBoundingBoxAscent * 0.5;
    }
    args.pos = pos;
    drawText_(app, args, text, false);
    return m;
};
export var clearScreen = function (app) {
    var ctx = app.ctx;
    ctx.clearRect.apply(ctx, __spreadArray([0, 0], app.size.xy, false));
};
//# sourceMappingURL=index.js.map