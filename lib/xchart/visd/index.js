import { donutChart } from "../charts/donut";
import { lineChart } from "../charts/line";
import { defaultLineChartOptions } from "../charts/line/types";
import { Tooltip } from "../components/tooltip";
import { clearScreen } from "../draw";
import { VEC2 } from "../utils/vector";
import { mount } from "xel";
export var VisdApp = function (cfg) {
    var resolution = cfg.resolution, container = cfg.container;
    resolution.x = resolution.x || 500;
    resolution.y = resolution.y || 500;
    var ratio = window.devicePixelRatio;
    var dpiRes = resolution.scale(ratio);
    var createCanvas = function (size) {
        var canvas = document.createElement("canvas");
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.setAttribute("style", "width: ".concat(resolution.x, "px; height: ").concat(resolution.y, "px;"));
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
        loopId: -1
    };
    var tooltip = Tooltip;
    var update = function (visd) {
        var ctx = visd.ctx, size = visd.size;
        clearScreen(visd);
        var center = size.scale(0.5);
        app.chartFunction();
        // donutChart(visd, center, data.values, ctx);
    };
    var loop = function (time, visd) {
        visd.time = time;
        update(visd);
        app.loopId = requestAnimationFrame(function (time) { return loop(time, visd); });
    };
    var stop = function () {
        if (app.loopId >= 0) {
            cancelAnimationFrame(app.loopId);
            app.loopId = -1;
        }
    };
    var start = function (fun) {
        var mounted = false;
        if (container) {
            container.appendChild(canvas);
        }
        window.addEventListener("mousemove", function (e) {
            var rect = canvas.getBoundingClientRect();
            app.mouse = VEC2(e.clientX - rect.x, e.clientY - rect.y).scale(ratio);
            if (!mounted) {
                tooltip.el = undefined;
                mount(tooltip, { target: container });
                mounted = true;
            }
            tooltip.state.position = VEC2(e.x, e.y);
        });
        app.chartFunction = fun;
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
    var setTooltipBody = function (body) {
        tooltip.state.body = body;
    };
    return { start: start, stop: stop, charts: charts, setTooltipBody: setTooltipBody };
};
//# sourceMappingURL=index.js.map