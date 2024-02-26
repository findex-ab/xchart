"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisdApp = void 0;
const donut_1 = require("../charts/donut");
const types_1 = require("../charts/donut/types");
const line_1 = require("../charts/line");
const types_2 = require("../charts/line/types");
const tooltip_1 = require("../components/tooltip");
const aabb_1 = require("../utils/aabb");
const etc_1 = require("../utils/etc");
const vector_1 = require("../utils/vector");
const xel_1 = require("xel");
const INSTANCE_LIMIT = 10;
const createApp = (cfg) => {
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
    const update = (visd) => {
        if (app.instances.length >= INSTANCE_LIMIT) {
            console.warn(`Instance limit reached. ${app.instances.length}`);
            stop();
            return;
        }
        for (let i = 0; i < app.instances.length; i++) {
            const instance = app.instances[i];
            if (instance.didRender && instance.config.onlyActiveWhenMouseOver) {
                const rect = instance.canvas.getBoundingClientRect();
                const bounds = {
                    min: (0, vector_1.VEC2)(rect.x, rect.y),
                    max: (0, vector_1.VEC2)(rect.x + rect.width, rect.y + rect.height)
                };
                if (!(0, aabb_1.aabbVSPoint2D)(bounds, app.mouse)) {
                    instance.tooltip.state.opacity = 0;
                    if (instance.tooltip.el) {
                        instance.tooltip.el.style.opacity = '0%';
                    }
                    continue;
                }
            }
            if (!instance.active)
                continue;
            let resolution = instance.config.resolution;
            let size = instance.config.size;
            if (instance.config.fitContainer && instance.config.container) {
                const rect = instance.config.container.getBoundingClientRect();
                //const rect = { width: r.width, height: r.height };
                if (instance.config.sizeClamp) {
                    const { min, max } = instance.config.sizeClamp;
                    rect.width = (0, etc_1.clamp)(rect.width, min.x, max.x);
                    rect.height = (0, etc_1.clamp)(rect.height, min.y, max.y);
                }
                size = (0, vector_1.VEC2)(rect.width, rect.height);
                resolution = (0, vector_1.VEC2)(rect.width, rect.height);
            }
            const sizes = computeSizes(resolution, // VEC2(instance.canvas.width, instance.canvas.height),
            size //VEC2(instance.canvas.width, instance.canvas.height)
            );
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
            instance.canvas.style.width = `${sizes.size.x}px`;
            instance.canvas.style.height = `${sizes.size.y}px`;
            instance.canvas.style.maxWidth = '100%';
            instance.canvas.style.maxHeight = instance.config.size ? `${instance.config.size.y}px` : '100%';
            instance.canvas.style.objectFit = "contain";
            instance.size = (0, vector_1.VEC2)(instance.canvas.width, instance.canvas.height);
            instance.resolution = sizes.resolution;
            instance.canvas.style.objectFit = "contain";
            const res = instance.resolution;
            const s = instance.size;
            const rect = instance.canvas.getBoundingClientRect();
            const rx = instance.canvas.width / rect.width;
            const ry = instance.canvas.height / rect.height;
            instance.mouse = app.mouse.clone();
            instance.mouse = instance.mouse.sub((0, vector_1.VEC2)(rect.x, rect.y)).mul((0, vector_1.VEC2)(rx, ry));
            //instance.resolution = instance.config.resolution;
            const center = app.instances[i].size.scale(0.5);
            app.instances[i].invMouseDistance = (0, etc_1.smoothstep)(app.instances[i].size.y * 0.6, app.instances[i].size.y * 0.4, app.instances[i].mouse.distance(center));
            instance.ctx.clearRect(0, 0, ...[instance.canvas.width, instance.canvas.height]);
            app.instances[i].fun(app.instances[i]);
            app.instances[i].didRender = true;
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
        const old = app.instances.find((inst) => inst.uid === instance.uid);
        if (old) {
            old.cancel();
        }
        const sizes = computeSizes(instance.config.resolution, instance.config.size);
        const canvas = createCanvas(sizes.resolution, sizes.size);
        const container = instance.config.container || cfg.container;
        //if (container) {
        //  container.appendChild(canvas);
        //}
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("unable to get context");
        const tooltip = tooltip_1.Tooltip.call({ position: (0, vector_1.VEC2)(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid });
        const inst = (0, xel_1.xReactive)(Object.assign(Object.assign({}, instance), { canvas: canvas, ctx, mouse: (0, vector_1.VEC2)(0, 0), invMouseDistance: 0, resolution: sizes.resolution, size: sizes.size, tooltip, setTooltipBody: (body) => {
                tooltip.state.body = body;
            }, active: true, cancel: () => {
                inst.canvas.remove();
                inst.active = false;
                app.instances = app.instances.filter(x => x.uid !== inst.uid);
            }, resume: () => {
                inst.active = true;
            }, xel: (() => {
                const xel = (0, xel_1.X)('div', {
                    onMount(self) {
                        self.el.appendChild(canvas);
                        (0, xel_1.mount)(tooltip, { target: instance.config.tooltipContainer || container || self.el });
                        app.instances.push(inst);
                    },
                    render() {
                        return (0, xel_1.X)('div', {});
                    }
                });
                return xel;
            })() }));
        return inst;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3Zpc2QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTZDO0FBQzdDLGlEQUkrQjtBQUMvQix5Q0FBMkM7QUFDM0MsZ0RBRzhCO0FBTzlCLG1EQUFnRDtBQUVoRCx3Q0FBb0Q7QUFDcEQsc0NBQWtEO0FBQ2xELDRDQUErQztBQUMvQyw2QkFBb0Q7QUFFcEQsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBeUUxQixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWUsRUFBbUIsRUFBRTtJQUNyRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVcsRUFBRSxDQUFTLEVBQUUsRUFBRTtRQUM5QyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBRXRCLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDbkMsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFFdEMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDaEIsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNwQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDOUIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxZQUFZLEdBQUcsQ0FDbkIsVUFBa0IsRUFDbEIsSUFBWSxFQUNP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