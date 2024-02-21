"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisdApp = void 0;
const reactive_1 = require("xel/build/module/xel/utils/reactivity/reactive");
const donut_1 = require("../charts/donut");
const types_1 = require("../charts/donut/types");
const line_1 = require("../charts/line");
const types_2 = require("../charts/line/types");
const tooltip_1 = require("../components/tooltip");
const etc_1 = require("../utils/etc");
const vector_1 = require("../utils/vector");
const xel_1 = require("xel");
const INSTANCE_LIMIT = 10;
const createApp = (cfg) => {
    const { container } = cfg;
    const shadowAlpha = cfg.shadowAlpha || 0;
    const shadowBlur = cfg.shadowBlur || 0;
    const computeSizes = (res, s) => {
        const resolution = res.clone();
        const size = s.clone();
        resolution.x = resolution.x || 500;
        resolution.y = resolution.y || 500;
        const ratio = window.devicePixelRatio;
        size.x /= ratio;
        size.y /= ratio;
        resolution.x = resolution.x * ratio;
        resolution.y = resolution.y * ratio;
        return { resolution, size };
    };
    const createCanvas = (resolution, size) => {
        const canvas = document.createElement("canvas");
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;
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
    const app = {
        time: 0,
        chartFunction: () => { },
        running: false,
        loopId: -1,
        instances: [],
        mouse: (0, vector_1.VEC2)(0, 0)
    };
    //mount(tooltip, { target: container });
    const updateTooltip = (instance) => {
        const rect = instance.canvas.getBoundingClientRect();
        instance.tooltip.state.position = instance.mouse.add((0, vector_1.VEC2)(rect.x, rect.y));
        instance.tooltip.state.opacity = Math.max(instance.invMouseDistance, instance.config.minTooltipOpacity || 0);
    };
    const update = (visd) => {
        if (app.instances.length >= INSTANCE_LIMIT) {
            console.warn(`Instance limit reached. ${app.instances.length}`);
            stop();
            return;
        }
        for (let i = 0; i < app.instances.length; i++) {
            const instance = app.instances[i];
            const sizes = computeSizes(instance.config.resolution, // VEC2(instance.canvas.width, instance.canvas.height),
            instance.config.size //VEC2(instance.canvas.width, instance.canvas.height)
            );
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
            instance.canvas.style.width = `${sizes.size.x}px`;
            instance.canvas.style.height = `${sizes.size.y}px`;
            instance.canvas.style.objectFit = "contain";
            instance.size = (0, vector_1.VEC2)(instance.canvas.width, instance.canvas.height);
            instance.resolution = sizes.resolution;
            instance.canvas.style.objectFit = "contain";
            const res = instance.resolution;
            const s = instance.size;
            const rect = instance.canvas.getBoundingClientRect();
            instance.mouse = (0, vector_1.VEC2)(app.mouse.x - rect.x, app.mouse.y - rect.y);
            //instance.resolution = instance.config.resolution;
            const center = app.instances[i].size.scale(0.5);
            app.instances[i].invMouseDistance = (0, etc_1.smoothstep)(app.instances[i].size.y * 0.6, app.instances[i].size.y * 0.4, app.instances[i].mouse.distance(center));
            instance.ctx.clearRect(0, 0, ...[app.instances[i].resolution.x, app.instances[i].resolution.y]);
            updateTooltip(instance);
            app.instances[i].fun(app.instances[i]);
        }
        //app.chartFunction()
    };
    const stop = () => {
        app.running = false;
        if (app.loopId >= 0) {
            cancelAnimationFrame(app.loopId);
            app.loopId = -1;
        }
    };
    const loop = (time, visd) => {
        try {
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
            app.loopId = requestAnimationFrame((time) => loop(time, visd));
        }
        catch (e) {
            console.error(e);
            stop();
            return () => { };
        }
        return () => {
            app.running = false;
            cancelAnimationFrame(app.loopId);
        };
    };
    const start = () => {
        if (app.running)
            return;
        window.addEventListener("mousemove", (e) => {
            app.mouse = (0, vector_1.VEC2)(e.clientX, e.clientY);
        });
        app.running = true;
        loop(0, app);
    };
    const insert = (instance) => {
        if (app.instances.find((inst) => inst.uid === instance.uid))
            return;
        const sizes = computeSizes(instance.config.resolution, instance.config.size);
        const canvas = createCanvas(sizes.resolution, sizes.size);
        const container = instance.config.container || cfg.container;
        if (container) {
            container.appendChild(canvas);
        }
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("unable to get context");
        const tooltip = tooltip_1.Tooltip.call({ position: (0, vector_1.VEC2)(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid });
        (0, xel_1.mount)(tooltip, { target: instance.config.tooltipContainer || container });
        const inst = (0, reactive_1.xReactive)(Object.assign(Object.assign({}, instance), { canvas: canvas, ctx, mouse: (0, vector_1.VEC2)(0, 0), invMouseDistance: 0, resolution: sizes.resolution, size: sizes.size, tooltip, setTooltipBody: (body) => {
                tooltip.state.body = body;
            } }));
        app.instances.push(inst);
    };
    const charts = {
        donut: (data, options = types_1.defaultDonutOptions) => {
            return (instance) => (0, donut_1.donutChart)(app, instance, data, options);
        },
        line: (data, options = types_2.defaultLineChartOptions) => {
            return (instance) => (0, line_1.lineChart)(app, instance, data, options);
        },
    };
    return { start, stop, insert, charts };
};
let vapp = undefined;
const VisdApp = (cfg) => {
    return (vapp = (vapp || createApp(cfg)));
};
exports.VisdApp = VisdApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3Zpc2QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkVBQTJFO0FBQzNFLDJDQUE2QztBQUM3QyxpREFJK0I7QUFDL0IseUNBQTJDO0FBQzNDLGdEQUc4QjtBQU85QixtREFBZ0Q7QUFFaEQsc0NBQTJDO0FBQzNDLDRDQUErQztBQUMvQyw2QkFBeUM7QUFFekMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBa0QxQixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWUsRUFBbUIsRUFBRTtJQUNyRCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBRTFCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBVyxFQUFFLENBQVMsRUFBRSxFQUFFO1FBQzlDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7UUFFdEIsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ25DLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUV0QyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNoQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUNoQixVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLFVBQVUsQ0FBQyxD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