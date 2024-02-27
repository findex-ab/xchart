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
            const sizes = computeSizes(resolution, size, instance.config, instance);
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
            instance.canvas.style.width = `${sizes.size.x}px`;
            instance.canvas.style.height = `${sizes.size.y}px`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMveGNoYXJ0L3Zpc2QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTZDO0FBQzdDLGlEQUkrQjtBQUMvQix5Q0FBMkM7QUFDM0MsZ0RBRzhCO0FBTzlCLG1EQUFnRDtBQUVoRCx3Q0FBb0Q7QUFDcEQsc0NBQWtEO0FBQ2xELDRDQUErQztBQUMvQyw2QkFBb0Q7QUFFcEQsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBMEUxQixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQWUsRUFBbUIsRUFBRTtJQUNyRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVcsRUFBRSxDQUFTLEVBQUUsV0FBK0IsRUFBRSxRQUF3QixFQUFFLEVBQUU7UUFDekcsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQy9CLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUV0QixVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ25DLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7UUFHbkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBRXRDLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1FBQ2hCLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDcEMsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUVwQyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQWdCLENBQUM7WUFFM0UsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDeEMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFBLFdBQUssRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEYsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLFdBQVcsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNuRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDeEUsVUFBVSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFDRCxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzlCLENBQUMsQ0FBQztJQUVGLE1BQU0sWUFBWSxHQUFHLENBQ25CLFVBQWtCLEVBQ2xCLElBQVksRUFDTyxFQUFFO1FBQ3JCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsTUFBTSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDbkMsc0JBQXNCO1FBQ3RCLFlBQVk7UUFDWixvQ0FBb0M7UUFDcEMsSUFBSTtRQUNKLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUVGLG9DQUFvQztJQUNwQyxzQ0FBc0M7SUFDdEMscURBQXFEO0lBQ3JELCtCQUErQjtJQUUvQixNQUFNLEdBQUcsR0FBUztRQUNoQixJQUFJLEVBQUUsQ0FBQztRQUNQLGFBQWEsRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDO1FBQ3ZCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNWLFNBQVMsRUFBRSxFQUFFO1FBQ2IsS0FBSyxFQUFFLElBQUEsYUFBSSxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbEIsQ0FBQztJQUVGLHlDQUF5QztJQUV6QyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQzVCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksY0FBYyxFQUFFLENBQUM7WUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTztRQUNULENBQUM7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksUUFBUSxDQUFDLFNBQVMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ2xFLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxNQUFNLEdBQVM7b0JBQ25CLEdBQUcsRUFBRSxJQUFBLGFBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLEdBQUcsRUFBRSxJQUFBLGFBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2lCQUNyRCxDQUFDO2dCQUNGLElBQUksQ0FBQyxJQUFBLG9CQUFhLEVBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN0QyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUNuQyxJQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQ3hCLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBa0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDNUQsQ0FBQztvQkFDRCxTQUFTO2dCQUNYLENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO2dCQUFFLFNBQVM7WUFFL0IsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDNUMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFFaEMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5RCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUMvRCxvREFBb0Q7Z0JBRXBELElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFBLFdBQUssRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBRUQsSUFBSSxHQUFHLElBQUEsYUFBSSxFQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyQyxVQUFVLEdBQUcsSUFBQSxhQUFJLEVBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFHN0MsQ0FBQztZQUdELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FDeEIsVUFBVSxFQUNWLElBQUksRUFDSixRQUFRLENBQUMsTUFBTSxFQUNmLFFBQVEsQ0FDVCxDQUFDO1lBS0YsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRCxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBSW5ELFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNsRixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUVoRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBQSxhQUFJLEVBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRSxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDdkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUU1QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDeEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRXJELE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDOUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUVoRCxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkMsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGFBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGFBQUksRUFBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUc1RSxtREFBbUQ7WUFFbkQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSxnQkFBVSxFQUM1QyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUM3QixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUM3QixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQ3hDLENBQUM7WUFHRixRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FDcEIsQ0FBQyxFQUNELENBQUMsRUFDRCxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDbkQsQ0FBQztZQUdGLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDcEMsQ0FBQztRQUNELHFCQUFxQjtJQUN2QixDQUFDLENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxHQUFHLEVBQUU7UUFDaEIsR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3BCLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7SUFDSCxDQUFDLENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxDQUFDLElBQVksRUFBRSxJQUFVLEVBQUUsRUFBRTtRQUN4QyxJQUFLLENBQUM7WUFDSixJQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pDLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2Isa0JBQWtCO1lBQ2xCLDBCQUEwQjtZQUMxQix1REFBdUQ7WUFDdkQsa0JBQWtCO1lBQ2xCLGFBQWE7WUFDYixHQUFHLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUE7UUFDakIsQ0FBQztRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1YsR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDcEIsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRTtRQUNqQixJQUFJLEdBQUcsQ0FBQyxPQUFPO1lBQUcsT0FBTztRQUV6QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFRLEVBQUU7WUFDL0MsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFBLGFBQUksRUFBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxDQUFDLFFBQTJCLEVBQWlCLEVBQUU7UUFDNUQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BFLElBQUksR0FBRyxFQUFFLENBQUM7WUFDUixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUN4QixRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDMUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQ3BCLFFBQVEsQ0FBQyxNQUFNLENBQ2hCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUM3RCxrQkFBa0I7UUFDbEIsa0NBQWtDO1FBQ2xDLEdBQUc7UUFFSCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxHQUFHO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBR25ELE1BQU0sT0FBTyxHQUFpRCxpQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFBLGFBQUksRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBaUQsQ0FBQztRQUcxTSxNQUFNLElBQUksR0FBa0IsSUFBQSxlQUFTLGtDQUNoQyxRQUFRLEtBQ1gsTUFBTSxFQUFFLE1BQU0sRUFDZCxHQUFHLEVBQ0gsS0FBSyxFQUFFLElBQUEsYUFBSSxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDakIsZ0JBQWdCLEVBQUUsQ0FBQyxFQUNuQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFDNUIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQ2hCLE9BQU8sRUFDUCxjQUFjLEVBQUUsQ0FBQyxJQUFjLEVBQUUsRUFBRTtnQkFDakMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQzVCLENBQUMsRUFDRCxNQUFNLEVBQUUsSUFBSSxFQUNaLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRSxDQUFDLEVBQ0QsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNyQixDQUFDLEVBQ0QsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFO2dCQUNULE1BQU0sR0FBRyxHQUFhLElBQUEsT0FBQyxFQUE4QixLQUFLLEVBQUU7b0JBQzFELE9BQU8sQ0FBQyxJQUFJO3dCQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMzQixJQUFBLFdBQUssRUFBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLElBQUssSUFBSSxDQUFDLEVBQWtCLEVBQUUsQ0FBQyxDQUFDO3dCQUN4RyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxNQUFNO3dCQUNKLE9BQU8sSUFBQSxPQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUksQ0FBQyxDQUFBO29CQUN2QixDQUFDO2lCQUNGLENBQUMsQ0FBQztnQkFFSCxPQUFPLEdBQUcsQ0FBQztZQUNiLENBQUMsQ0FBQyxFQUFFLElBQ0osQ0FBQztRQUdILE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0lBRUYsTUFBTSxNQUFNLEdBQUc7UUFDYixLQUFLLEVBQUUsQ0FBQyxJQUFlLEVBQUUsVUFBd0IsMkJBQW1CLEVBQUUsRUFBRTtZQUN0RSxPQUFPLENBQUMsUUFBdUIsRUFBRSxFQUFFLENBQ2pDLElBQUEsa0JBQVUsRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsSUFBSSxFQUFFLENBQ0osSUFBZSxFQUNmLFVBQXdCLCtCQUF1QixFQUMvQyxFQUFFO1lBQ0YsT0FBTyxDQUFDLFFBQXVCLEVBQUUsRUFBRSxDQUNqQyxJQUFBLGdCQUFTLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUNGLENBQUM7SUFFRixPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDekMsQ0FBQyxDQUFDO0FBRUYsSUFBSSxJQUFJLEdBQWdDLFNBQVMsQ0FBQztBQUUzQyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQWUsRUFBbUIsRUFBRTtJQUMxRCxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFDO0FBRlcsUUFBQSxPQUFPLFdBRWxCIn0=