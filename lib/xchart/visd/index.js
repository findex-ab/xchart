var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { xReactive } from "xel/lib/xel/utils/reactivity/reactive";
import { donutChart } from "../charts/donut";
import { defaultDonutOptions, } from "../charts/donut/types";
import { lineChart } from "../charts/line";
import { defaultLineChartOptions, } from "../charts/line/types";
import { Tooltip } from "../components/tooltip";
import { smoothstep } from "../utils/etc";
import { VEC2 } from "../utils/vector";
import { mount } from "xel/lib/xel";
var createApp = function (cfg) {
    var container = cfg.container;
    var shadowAlpha = cfg.shadowAlpha || 0;
    var shadowBlur = cfg.shadowBlur || 0;
    var computeSizes = function (res, s) {
        var resolution = res.clone();
        var size = s.clone();
        resolution.x = resolution.x || 500;
        resolution.y = resolution.y || 500;
        var ratio = window.devicePixelRatio;
        size.x /= ratio;
        size.y /= ratio;
        resolution.x = resolution.x * ratio;
        resolution.y = resolution.y * ratio;
        return { resolution: resolution, size: size };
    };
    var createCanvas = function (resolution, size) {
        var canvas = document.createElement("canvas");
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        canvas.style.width = "".concat(size.x, "px");
        canvas.style.height = "".concat(size.y, "px");
        canvas.style.objectFit = "contain";
        //canvas.setAttribute(
        //  "style",
        //  `width: ${W}px; height: ${H}px;`
        //);
        return canvas;
    };
    //  ctx.imageSmoothingEnabled = true
    //  ctx.imageSmoothingQuality = 'high'
    //  ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
    //  ctx.shadowBlur = shadowBlur
    var app = {
        time: 0,
        chartFunction: function () { },
        running: false,
        loopId: -1,
        instances: [],
        mouse: VEC2(0, 0)
    };
    //mount(tooltip, { target: container });
    var updateTooltip = function (instance) {
        var rect = instance.canvas.getBoundingClientRect();
        instance.tooltip.state.position = instance.mouse.add(VEC2(rect.x, rect.y));
        instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
    };
    var update = function (visd) {
        var _a;
        for (var i = 0; i < app.instances.length; i++) {
            var instance = app.instances[i];
            var sizes = computeSizes(instance.config.resolution, // VEC2(instance.canvas.width, instance.canvas.height),
            instance.config.size //VEC2(instance.canvas.width, instance.canvas.height)
            );
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
            instance.canvas.style.width = "".concat(sizes.size.x, "px");
            instance.canvas.style.height = "".concat(sizes.size.y, "px");
            instance.canvas.style.objectFit = "contain";
            instance.size = VEC2(instance.canvas.width, instance.canvas.height);
            instance.resolution = sizes.resolution;
            instance.canvas.style.objectFit = "contain";
            var res = instance.resolution;
            var s = instance.size;
            var rect = instance.canvas.getBoundingClientRect();
            instance.mouse = VEC2(app.mouse.x - rect.x, app.mouse.y - rect.y);
            //instance.resolution = instance.config.resolution;
            var center = app.instances[i].size.scale(0.5);
            app.instances[i].invMouseDistance = smoothstep(app.instances[i].size.y * 0.6, app.instances[i].size.y * 0.4, app.instances[i].mouse.distance(center));
            (_a = instance.ctx).clearRect.apply(_a, __spreadArray([0,
                0], [app.instances[i].resolution.x, app.instances[i].resolution.y], false));
            updateTooltip(instance);
            app.instances[i].fun(app.instances[i]);
        }
        //app.chartFunction()
    };
    var loop = function (time, visd) {
        if (!app.running) {
            cancelAnimationFrame(app.loopId);
            return;
        }
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
    var start = function () {
        if (app.running)
            return;
        window.addEventListener("mousemove", function (e) {
            app.mouse = VEC2(e.clientX, e.clientY);
            for (var _i = 0, _a = app.instances; _i < _a.length; _i++) {
                var instance = _a[_i];
            }
        });
        app.running = true;
        loop(0, app);
    };
    var insert = function (instance) {
        if (app.instances.find(function (inst) { return inst.uid === instance.uid; }))
            return;
        var sizes = computeSizes(instance.config.resolution, instance.config.size);
        var canvas = createCanvas(sizes.resolution, sizes.size);
        var container = instance.config.container || cfg.container;
        if (container) {
            container.appendChild(canvas);
        }
        var ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("unable to get context");
        var tooltip = Tooltip.call({ position: VEC2(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid });
        mount(tooltip, { target: instance.config.tooltipContainer || container });
        var inst = xReactive(__assign(__assign({}, instance), { canvas: canvas, ctx: ctx, mouse: VEC2(0, 0), invMouseDistance: 0, resolution: sizes.resolution, size: sizes.size, tooltip: tooltip, setTooltipBody: function (body) {
                tooltip.state.body = body;
            } }));
        app.instances.push(inst);
    };
    var charts = {
        donut: function (data, options) {
            if (options === void 0) { options = defaultDonutOptions; }
            return function (instance) {
                return donutChart(app, instance, data, options);
            };
        },
        line: function (data, options) {
            if (options === void 0) { options = defaultLineChartOptions; }
            return function (instance) {
                return lineChart(app, instance, data, options);
            };
        },
    };
    var stop = function () {
        app.running = false;
        if (app.loopId >= 0) {
            cancelAnimationFrame(app.loopId);
            app.loopId = -1;
        }
    };
    return { start: start, stop: stop, insert: insert, charts: charts };
};
var vapp = undefined;
export var VisdApp = function (cfg) {
    return (vapp = (vapp || createApp(cfg)));
};
//# sourceMappingURL=index.js.map