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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_YEAR = exports.ONE_MONTH = exports.ONE_WEEK = exports.ONE_DAY = exports.ONE_HOUR = exports.ONE_MINUTE = void 0;
const xel_1 = require("xel");
const xchart_1 = require("../xchart");
const fns = __importStar(require("date-fns"));
const data_json_1 = __importDefault(require("../data/data.json"));
const date_1 = require("../xchart/utils/date");
exports.ONE_MINUTE = 1000 * 60;
exports.ONE_HOUR = exports.ONE_MINUTE * 60;
exports.ONE_DAY = exports.ONE_HOUR * 24;
exports.ONE_WEEK = exports.ONE_DAY * 7;
exports.ONE_MONTH = exports.ONE_WEEK * 4;
exports.ONE_YEAR = exports.ONE_MONTH * 12;
function mergePerformanceData(data) {
    const groupedByDate = {};
    // Group items by date
    data.forEach((item) => {
        // Convert the date to a string to use as a key
        const dateKey = new Date(item.date).toISOString().split('T')[0];
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(item);
    });
    // Merge items by summing their values
    const mergedData = Object.keys(groupedByDate).map((date) => {
        const sum = groupedByDate[date].reduce((acc, curr) => acc + curr.accMonetaryPerf, 0);
        return {
            date: new Date(date),
            accMonetaryPerf: sum,
        };
    });
    return mergedData;
}
const data = data_json_1.default;
const App = (0, xel_1.X)('div', {
    style: {},
    render() {
        const vis = (0, xchart_1.VisdApp)({
            container: document.body,
        });
        const resolution = (0, xchart_1.VEC2)(640, 480).scale(1.5);
        const sortedData = mergePerformanceData(data).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const dataDates = sortedData.map((it) => new Date(it.date));
        const dataValues = sortedData.map((it) => it.accMonetaryPerf);
        const N = 2500;
        const dates = (0, xchart_1.range)(N).map((i) => new Date(Math.floor((0, xchart_1.lerp)(2000, 2024, i / N)) + '-01-01')); //sortedData.map((it) => new Date(it.date));
        const values = (0, xchart_1.range)(N).map((i) => (0, xchart_1.noise)((i / N) * 300.0312)); //sortedData.map((it) => it.accMonetaryPerf);
        const instance = vis.insert({
            uid: '5492',
            config: {
                onlyActiveWhenMouseOver: true,
                fitContainer: true,
                resolution: resolution,
                size: resolution,
                minTooltipOpacity: 1,
                sizeClamp: {
                    min: resolution,
                    max: resolution,
                },
            },
            fun: vis.charts.line({
                values: dataValues,
                //labels: items.value.map(t => t.date.toString())
            }, {
                autoFit: false,
                drawLabels: true,
                drawPoints: true,
                fitContainer: true,
                padding: 0.0003,
                smoothPath: true,
                fontSize: '1rem',
                thick: 4,
                xAxis: {
                    format: (x) => {
                        return fns.format(x, 'y-m-d');
                    },
                    range: {
                        start: (0, date_1.minDate)(dataDates),
                        end: (0, date_1.maxDate)(dataDates),
                        step: exports.ONE_YEAR,
                    },
                },
                callback: (instance, value, index) => {
                    instance.setTooltipBody((0, xel_1.X)('div', {
                        render() {
                            return (0, xel_1.X)('div', {
                                innerText: `${value}`,
                            });
                        },
                    }));
                },
            }),
        });
        vis.start();
        return (0, xel_1.X)('div', {
            children: [
                (0, xel_1.X)('div', {
                    style: {
                        borderStyle: 'solid',
                        borderWidth: '2px',
                        borderColor: 'black',
                        width: '640px',
                        height: '480px'
                    },
                    children: [instance.xel],
                }),
            ],
        });
    },
});
(0, xel_1.mount)(App, { target: document.getElementById('app') });
