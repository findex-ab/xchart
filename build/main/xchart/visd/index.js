"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisdApp = void 0;
const donut_1 = require("../charts/donut");
const types_1 = require("../charts/donut/types");
const line_1 = require("../charts/line");
const types_2 = require("../charts/line/types");
const tooltip_1 = require("../components/tooltip");
const action_1 = require("../types/action");
const aabb_1 = require("../utils/aabb");
const array_1 = require("../utils/array");
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
        //const ratio = window.devicePixelRatio;
        //size.x /= ratio;
        //size.y /= ratio;
        //resolution.x = resolution.x * ratio;
        //resolution.y = resolution.y * ratio;
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
        canvas.style.width = `${size.x}px`; //`100%`;
        canvas.style.height = `${size.y}px`; ///`100%`;
        canvas.style.objectFit = "contain";
        //canvas.setAttribute(
        //  "style",
        //  `width: ${W}px; height: ${H}px;`
        //);
        return canvas;
    };
    const app = {
        time: 0,
        deltaTime: 0,
        lastTime: 0,
        chartFunction: () => { },
        running: false,
        loopId: -1,
        instances: [],
        mouse: (0, vector_1.VEC2)(0, 0),
        actionQueue: []
    };
    //mount(tooltip, { target: container }); 
    const update = (visd) => {
        if (app.instances.length >= INSTANCE_LIMIT) {
            app.instances = (0, array_1.uniqueBy)(app.instances, 'uid');
            console.warn(`Instance limit reached. ${app.instances.length}`);
            return;
        }
        for (let i = 0; i < app.instances.length; i++) {
            const instance = app.instances[i];
            const actions = app.actionQueue.filter(action => action.instanceUid === instance.uid);
            const proceed = !!actions.find(action => action.type === action_1.EActionType.UPDATE);
            if (instance.renderCount >= 60 && instance.config.onlyActiveWhenMouseOver && !proceed) {
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
            if (!instance.active && !proceed && instance.renderCount >= 60)
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
            instance.canvas.style.width = `${sizes.size.x}px`; //`100%`;
            instance.canvas.style.height = `${sizes.size.y}px`; //`100%`;
            //
            if (instance.config.fullWidth && instance.xel && instance.xel.el) {
                const el = (instance.xel.el);
                const elRect = el.getBoundingClientRect();
                const parent = (instance.xel.el.parentElement || instance.xel.el);
                const elRectParent = parent.getBoundingClientRect();
                let height = elRect.height;
                instance.canvas.style.width = `100%`;
                instance.canvas.style.height = `100%`;
                instance.canvas.style.maxHeight = `${elRectParent.height}px`;
                instance.canvas.style.maxWidth = ``;
                //instance.canvas.style.maxHeight = ``;
                const canvasRect = instance.canvas.getBoundingClientRect();
                instance.size.x = canvasRect.width;
                instance.size.y = canvasRect.height;
            }
            else if (instance.config.responsive && instance.xel && instance.xel.el) {
                const el = (instance.xel.el);
                const parent = (instance.xel.el.parentElement || instance.xel.el);
                const elRect = el.getBoundingClientRect();
                //const elRectParent = parent.getBoundingClientRect();
                let width = parseFloat(getComputedStyle(parent).width); //Math.max(elRect.width, elRectParent.width);
                let height = elRect.height;
                instance.canvas.style.width = `${width}px`;
                instance.canvas.style.height = `${height}px`;
                instance.canvas.style.maxWidth = `${width}px`;
                instance.canvas.style.maxHeight = `${height}px`;
                const canvasRect = instance.canvas.getBoundingClientRect();
                instance.size.x = canvasRect.width;
                instance.size.y = canvasRect.height;
            }
            else if (instance.config.fitContainer && instance.xel && instance.xel.el) {
                const el = (instance.xel.el.parentElement || instance.xel.el);
                const style = getComputedStyle(el);
                instance.canvas.style.width = style.width;
                instance.canvas.style.height = style.height;
            }
            else {
                instance.canvas.style.maxWidth = `min(${Math.max(resolution.x, size.x)}px, 100%)`;
                instance.canvas.style.maxHeight = instance.config.size ? `${instance.config.size.y}px` : '100%';
                instance.size = (0, vector_1.VEC2)(instance.canvas.width, instance.canvas.height);
                instance.resolution = sizes.resolution;
            }
            instance.canvas.width = sizes.resolution.x;
            instance.canvas.height = sizes.resolution.y;
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
            app.instances[i].renderCount += 1;
            app.actionQueue = app.actionQueue.filter(action => action.instanceUid !== instance.uid);
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
        app.deltaTime = (time - app.lastTime) / 1000;
        app.lastTime = time;
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
        const initCfg = instance;
        const old = app.instances.find((inst) => inst.uid === instance.uid);
        if (old) {
            //return old;
            old.cancel();
            app.instances = app.instances.filter(it => it.uid !== instance.uid);
        }
        const sizes = computeSizes(instance.config.resolution, instance.config.size, instance.config);
        const canvas = createCanvas(sizes.resolution, sizes.size);
        const container = instance.config.container || cfg.container;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("unable to get context");
        const tooltip = tooltip_1.Tooltip.call({ position: (0, vector_1.VEC2)(app.mouse.x, app.mouse.y), opacity: 1.0, uid: instance.uid });
        const inst = (0, xel_1.xReactive)(Object.assign(Object.assign({}, instance), { renderCount: 0, canvas: canvas, ctx, mouse: (0, vector_1.VEC2)(0, 0), invMouseDistance: 0, resolution: sizes.resolution, size: sizes.size, tooltip, setTooltipBody: (body) => {
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
                    style: {
                        width: '100%'
                    },
                    onMount(_self) {
                        console.log('mounted');
                        const old = app.instances.find((inst) => inst.uid === instance.uid);
                        if (old) {
                            old.renderCount = 0;
                        }
                        else {
                            app.instances.push(inst);
                        }
                        if (initCfg.onMount) {
                            initCfg.onMount(old || inst);
                        }
                    },
                    children: [canvas, tooltip]
                });
                return xel;
            })() }));
        return inst;
    };
    const charts = {
        donut: (data, options = types_1.defaultDonutOptions) => {
            return (instance) => {
                (0, donut_1.donutChart)(app, instance, data, options);
            };
        },
        line: (data, options = types_2.defaultLineChartOptions) => {
            return (0, line_1.lineChart)(app, data, options);
        },
    };
    const request = (action) => {
        if (!action.instanceUid)
            return;
        if (!app.instances)
            return;
        const avail = app.instances.map(inst => inst.uid);
        if (!avail.includes(action.instanceUid)) {
            console.warn(`No such instance "${action.instanceUid}"`);
            console.log('Available:');
            console.log(avail);
            return;
        }
        app.actionQueue.push(action);
    };
    return { start, stop, insert, charts, visd: app, request };
};
// @ts-ignore
let vapp = undefined | window.vapp;
const VisdApp = (cfg) => {
    if (vapp)
        return vapp;
    // @ts-ignore
    window.vapp = vapp = createApp(cfg);
    return vapp;
};
exports.VisdApp = VisdApp;
