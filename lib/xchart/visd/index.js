var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { donutChart } from "../charts/donut";
import { lineChart } from "../charts/line";
import { defaultLineChartOptions } from "../charts/line/types";
import { Tooltip } from "../components/tooltip";
import { smoothstep } from "../utils/etc";
import { VEC2 } from "../utils/vector";
import { mount } from "xel";
export var VisdApp = function (cfg) {
    var size = cfg.size, container = cfg.container;
    size.x = size.x || 500;
    size.y = size.y || 500;
    //  const size = cfg.size || size
    var ratio = window.devicePixelRatio;
    size.x /= ratio;
    size.y /= ratio;
    size.x = size.x * ratio;
    size.y = size.y * ratio;
    var shadowAlpha = cfg.shadowAlpha || 0;
    var shadowBlur = cfg.shadowBlur || 0;
    var createCanvas = function () {
        var canvas = document.createElement("canvas");
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.width = "".concat(size.x, "px");
        canvas.style.height = "".concat(size.y, "px");
        canvas.style.objectFit = 'contain';
        //canvas.setAttribute(
        //  "style",
        //  `width: ${W}px; height: ${H}px;`
        //);
        return canvas;
    };
    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('Unable to get canvas context');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.shadowColor = "rgba(0, 0, 0, ".concat(shadowAlpha, ")");
    ctx.shadowBlur = shadowBlur;
    var app = {
        canvas: canvas,
        ctx: ctx,
        size: size,
        //   size: size,
        time: 0,
        mouse: VEC2(0, 0),
        chartFunction: function () { },
        running: false,
        loopId: -1,
        invMouseDistance: 0,
    };
    var tooltip = Tooltip.call({});
    // @ts-ignore
    mount(tooltip, { target: container });
    var update = function (visd) {
        var ctx = visd.ctx;
        var center = app.size.scale(0.5);
        app.invMouseDistance = smoothstep(app.size.y * 0.6, app.size.y * 0.4, app.mouse.distance(center));
        var rect = canvas.getBoundingClientRect();
        tooltip.state.position = app.mouse.add(VEC2(rect.x, rect.y));
        tooltip.state.opacity = app.invMouseDistance;
        // if (cfg.scale && cfg.scale > 0.00001) {
        //   ctx.scale(cfg.scale, cfg.scale);
        //}
        ctx.clearRect.apply(ctx, __spreadArray([0, 0], [app.size.x, app.size.y], false));
        app.chartFunction();
    };
    var loop = function (time, visd) {
        visd.time = time;
        update(visd);
        //ctx.beginPath();
        //ctx.fillStyle = 'black';
        //ctx.arc(app.mouse.x, app.mouse.y, 4, 0, Math.PI*2.0);
        //ctx.closePath();
        //ctx.fill();
        app.loopId = requestAnimationFrame(function (time) { return loop(time, visd); });
        return function () {
            app.running = false;
            cancelAnimationFrame(app.loopId);
        };
    };
    var start = function (fun) {
        app.chartFunction = fun;
        if (container) {
            container.appendChild(canvas);
        }
        window.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y);
        });
        //canvas.addEventListener('mouseenter', () => {
        //  if (!app.running) {
        //    loop(0, app);
        //    app.running = true;
        //  }
        //  tooltip.state.opacity = 1;
        //});
        //canvas.addEventListener('mouseleave', () => {
        //  if (app.running) {
        //    app.running = false;
        //    setTimeout(() => {
        //        cancelAnimationFrame(app.loopId);
        //        tooltip.state.opacity = 0;
        //    }, 10);
        //  }
        //})
        app.running = true;
        loop(0, app);
    };
    var charts = {
        donut: function (data, options, callback) {
            var center = app.size.scale(0.5);
            return function () { return donutChart(app, center, data, options, callback); };
        },
        line: function (data, options) {
            if (options === void 0) { options = defaultLineChartOptions; }
            return function () { return lineChart(app, data, options); };
        }
    };
    //const charts = {
    //  donut: (data: ChartData, options: DonutOptions, callback: (segment: DonutSegment) => void) => {
    //    const center = app.size.scale(0.5)
    //    return () => donutChart(app, center, data, options, callback)
    //  }
    //}
    var setTooltipBody = function (body) {
        tooltip.state.body = body;
    };
    return { start: start, charts: charts, setTooltipBody: setTooltipBody, canvas: canvas };
};
export var VisdApp__backup = function (cfg) {
    var size = cfg.size, container = cfg.container;
    size.x = size.x || 500;
    size.y = size.y || 500;
    var ratio = window.devicePixelRatio;
    var dpiRes = size.scale(ratio);
    var createCanvas = function (size) {
        var canvas = document.createElement("canvas");
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.setAttribute("style", "width: ".concat(size.x, "px; height: ").concat(size.y, "px;"));
        return canvas;
    };
    var canvas = createCanvas(dpiRes);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    //ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    //ctx.shadowBlur = 12;
    var app = {
        canvas: canvas,
        ctx: ctx,
        size: dpiRes,
        time: 0,
        mouse: VEC2(0, 0),
        chartFunction: function () { },
        loopId: -1,
        invMouseDistance: 0,
        running: false
    };
    var tooltip = Tooltip.call({});
    // @ts-ignore
    mount(tooltip, { target: container });
    var update = function (visd) {
        var ctx = visd.ctx, size = visd.size;
        var center = app.size.scale(0.5);
        app.invMouseDistance = smoothstep(app.size.y * 0.6, app.size.y * 0.4, app.mouse.distance(center));
        var rect = canvas.getBoundingClientRect();
        tooltip.state.position = app.mouse.add(VEC2(rect.x, rect.y));
        tooltip.state.opacity = app.invMouseDistance;
        // if (cfg.scale && cfg.scale > 0.00001) {
        //   ctx.scale(cfg.scale, cfg.scale);
        //}
        ctx.clearRect.apply(ctx, __spreadArray([0, 0], [app.size.x, app.size.y], false));
        app.chartFunction();
    };
    var loop = function (time, visd) {
        visd.time = time;
        update(visd);
        //ctx.beginPath();
        //ctx.fillStyle = 'black';
        //ctx.arc(app.mouse.x, app.mouse.y, 4, 0, Math.PI*2.0);
        //ctx.closePath();
        //ctx.fill();
        app.loopId = requestAnimationFrame(function (time) { return loop(time, visd); });
        return function () {
            app.running = false;
            cancelAnimationFrame(app.loopId);
        };
    };
    var start = function (fun) {
        app.chartFunction = fun;
        if (container) {
            container.appendChild(canvas);
        }
        window.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y);
        });
        //canvas.addEventListener('mouseenter', () => {
        //  if (!app.running) {
        //    loop(0, app);
        //    app.running = true;
        //  }
        //  tooltip.state.opacity = 1;
        //});
        //canvas.addEventListener('mouseleave', () => {
        //  if (app.running) {
        //    app.running = false;
        //    setTimeout(() => {
        //        cancelAnimationFrame(app.loopId);
        //        tooltip.state.opacity = 0;
        //    }, 10);
        //  }
        //})
        app.running = true;
        loop(0, app);
    };
    //  const loop = (time: number, visd: Visd) => {
    //    visd.time = time;
    //    update(visd);
    //    app.loopId = requestAnimationFrame((time: number) => loop(time, visd));
    //  };
    //
    //
    var stop = function () {
        app.running = false;
        if (app.loopId >= 0) {
            cancelAnimationFrame(app.loopId);
            app.loopId = -1;
        }
    };
    //
    //  const start = (fun: ChartFunction) => {
    //
    //    let mounted = false;
    //    
    //    if (container) {
    //      container.appendChild(canvas);
    //    }
    //
    //    window.addEventListener("mousemove", (e):void => {
    //      const rect = canvas.getBoundingClientRect();
    //      app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y).scale(ratio);
    //
    //      if (!mounted) {
    //        tooltip.el = undefined;
    //        mount(tooltip, { target: container });
    //        mounted = true;
    //      }
    //
    //      tooltip.state.position = VEC2(e.x, e.y);
    //    });
    //
    //    app.chartFunction = fun;
    //    
    //    loop(0, app);
    //  };
    var charts = {
        donut: function (data, options, callback) {
            var center = app.size.scale(0.5);
            return function () { return donutChart(app, center, data, options, callback); };
        },
        line: function (data, options) {
            if (options === void 0) { options = defaultLineChartOptions; }
            return function () { return lineChart(app, data, options); };
        }
    };
    var setTooltipBody = function (body) {
        tooltip.state.body = body;
    };
    return { start: start, stop: stop, charts: charts, setTooltipBody: setTooltipBody };
};
//# sourceMappingURL=index.js.map