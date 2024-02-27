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
    const computeSizes = (res, s, instanceCfg, instance) => {
        const resolution = res.clone();
        const size = s.clone();
        resolution.x = resolution.x || 500;
        resolution.y = resolution.y || 500;
        const ratio = window.devicePixelRatio;
        size.x /= ratio;
        size.y /= ratio;
        resolution.x = resolution.x * ratio;
        resolution.y = resolution.y * ratio;
        if (instance && instance.xel && instance.xel.el) {
            let el = (instance.xel.el.parentElement || instance.xel.el);
            const rect = el.getBoundingClientRect();
            if (rect.width > 1 && rect.height > 1) {
                size.x = (0, etc_1.clamp)(size.x, instanceCfg.fitContainer ? rect.width : 0, rect.width);
                size.y = (0, etc_1.clamp)(size.y, instanceCfg.fitContainer ? rect.height : 0, rect.height);
            }
        }
        if (instanceCfg.aspectRatio && instanceCfg.aspectRatio.mag() > 0.1) {
            size.y = size.x / instanceCfg.aspectRatio.x * instanceCfg.aspectRatio.y;
            resolution.y = resolution.x / instanceCfg.aspectRatio.x * instanceCfg.aspectRatio.y;
        }
        return { resolution, size };
    };
    const createCanvas = (resolution, size) => {
        const canvas = document.createElement("canvas");
        canvas.width = resolution.x;
        canvas.height = resolution.y;
        canvas.style.width = `100%`;
        canvas.style.height = `100%`;
        canvas.style.objectFit = "contain";
        //canvas.setAttribute(
        //  "style",
        //  `width: ${W}px; height: ${H}px;`
        //);
        return canvas;
    };
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
                        instance.tooltip.el.style.pointerEvents = 'none';
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
            const sizes = computeSizes(resolution, size, instance.config, instance);
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
            instance.canvas.style.width = `100%`;
            instance.canvas.style.height = `100%`;
            instance.canvas.style.maxWidth = `min(${Math.max(resolution.x, size.x)}px, 100%)`;
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
            instance.ctx.imageSmoothingEnabled = true;
            instance.ctx.imageSmoothingQuality = 'high';
            //instance.ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
            //instance.ctx.shadowBlur = shadowBlur
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
        const sizes = computeSizes(instance.config.resolution, instance.config.size, instance.config);
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
                if (inst.xel.el) {
                    inst.xel.el.remove();
                }
                if (inst.tooltip.el) {
                    inst.tooltip.el.remove();
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3Zpc2QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTZDO0FBQzdDLGlEQUkrQjtBQUMvQix5Q0FBMkM7QUFDM0MsZ0RBRzhCO0FBTzlCLG1EQUFnRDtBQUVoRCx3Q0FBb0Q7QUFDcEQsc0NBQWtEO0FBQ2xELDRDQUErQztBQUMvQyw2QkFBb0Q7QUFFcEQsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBMEUxQixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWUsRUFBbUIsRUFBRTtJQUNyRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVcsRUFBRSxDQUFTLEVBQUUsV0FBK0IsRUFBRSxRQUF3QixFQUFFLEVBQUU7UUFDekcsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUV0QixVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ25DLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7UUFHbkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBRXRDLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1FBQ2hCLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDcEMsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUVwQyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQs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QyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztZQUNyQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBSXRDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNsRixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUVoRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBQSxhQUFJLEVBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRSxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDdkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUU1QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDeEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRXJELE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFL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