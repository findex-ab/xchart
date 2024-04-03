"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xel_1 = require("xel");
const xchart_1 = require("../xchart");
const fns = __importStar(require("date-fns"));
const randomItem = (seed) => {
    const date = new Date(new Date().getTime() + 50000000 * seed);
    return {
        value: ((0, xchart_1.noise)(seed) * 1000) + 500 * ((0, xchart_1.noise)((seed + 3.39182) * 2)),
        date: date,
    };
};
const N = 500;
const F = 10;
const data = (0, xchart_1.range)(N)
    .map((i) => randomItem((i / N) * F))
    .sort((a, b) => fns.compareAsc(a.date, b.date));
const SIZE = (0, xchart_1.VEC2)(640, 480).scale(1.6);
const visd = (0, xchart_1.VisdApp)({
    container: document.body,
});
const App = (0, xel_1.X)('div', {
    style: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    children: [
        (0, xel_1.X)('div', {
            style: {
                width: '500px',
                height: '500px'
            },
            render() {
                const chart = visd.insert({
                    uid: 'mychart',
                    config: {
                        size: SIZE,
                        resolution: SIZE.scale(0.5),
                        aspectRatio: (0, xchart_1.VEC2)(16, 9)
                    },
                    fun: visd.charts.line({
                        values: data.map((it) => it.value),
                        dates: data.map((it) => it.date),
                    }, {
                        callback(instance, key, value, index) {
                            instance.setTooltipBody((0, xel_1.X)('div', {
                                children: [
                                    (0, xel_1.X)('p', { innerText: fns.format(key, 'dd MMM, yyy') }),
                                    (0, xel_1.X)('p', { innerText: value })
                                ]
                            }));
                        }
                    }),
                });
                visd.start();
                return chart.xel;
            },
        }),
    ],
});
(0, xel_1.mount)(App, { target: document.getElementById('app') });
