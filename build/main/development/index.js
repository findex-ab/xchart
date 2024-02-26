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
                        borderWidth: '20px',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGV2ZWxvcG1lbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBK0I7QUFDL0Isc0NBQThEO0FBRTlELDhDQUFnQztBQUNoQyxrRUFBc0M7QUFDdEMsK0NBQXdEO0FBRTNDLFFBQUEsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBQSxRQUFRLEdBQUcsa0JBQVUsR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBQSxPQUFPLEdBQUcsZ0JBQVEsR0FBRyxFQUFFLENBQUM7QUFDeEIsUUFBQSxRQUFRLEdBQUcsZUFBTyxHQUFHLENBQUMsQ0FBQztBQUN2QixRQUFBLFNBQVMsR0FBRyxnQkFBUSxHQUFHLENBQUMsQ0FBQztBQUN6QixRQUFBLFFBQVEsR0FBRyxpQkFBUyxHQUFHLEVBQUUsQ0FBQztBQVl2QyxTQUFTLG9CQUFvQixDQUMzQixJQUF1QjtJQUV2QixNQUFNLGFBQWEsR0FBeUMsRUFBRSxDQUFDO0lBRS9ELHNCQUFzQjtJQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDcEIsK0NBQStDO1FBQy9DLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzVCLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxzQ0FBc0M7SUFDdEMsTUFBTSxVQUFVLEdBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUMzRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ1AsTUFBTSxHQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FDcEMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFDekMsQ0FBQyxDQUNGLENBQUM7UUFDRixPQUFPO1lBQ0wsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztZQUNwQixlQUFlLEVBQUUsR0FBRztTQUNyQixDQUFDO0lBQ0osQ0FBQyxDQUNGLENBQUM7SUFFRixPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBRUQsTUFBTSxJQUFJLEdBQUcsbUJBQTBCLENBQUM7QUFFeEMsTUFBTSxHQUFHLEdBQUcsSUFBQSxPQUFDLEVBQUMsS0FBSyxFQUFFO0lBQ25CLEtBQUssRUFBRSxFQUFFO0lBQ1QsTUFBTTtRQUNKLE1BQU0sR0FBRyxHQUFHLElBQUEsZ0JBQU8sRUFBQztZQUNsQixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUk7U0FDekIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBQSxhQUFJLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3QyxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUQsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTlELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUEsY0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDeEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBQSxhQUFJLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FDaEUsQ0FBQyxDQUFDLDRDQUE0QztRQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFBLGNBQUssRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsY0FBSyxFQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyw2Q0FBNkM7UUFFNUcsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUMxQixHQUFHLEVBQUUsTUFBTTtZQUNYLE1BQU0sRUFBRTtnQkFDTix1QkFBdUIsRUFBRSxJQUFJO2dCQUM3QixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLElBQUksRUFBRSxVQUFVO2dCQUNoQixpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixTQUFTLEVBQUU7b0JBQ1QsR0FBRyxFQUFFLFVBQVU7b0JBQ2YsR0FBRyxFQUFFLFVBQVU7aUJBQ2hCO2FBQ0Y7WUFDRCxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2xCO2dCQUNFLE1BQU0sRUFBRSxVQUFVO2dCQUNsQixpREFBaUQ7YUFDbEQsRUFDRDtnQkFDRSxPQUFPLEVBQUUsS0FBSztnQkFDZCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLE9BQU8sRUFBRSxNQUFNO2dCQUNmLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLE1BQU0sRUFBRSxDQUFDLENBQWMsRUFBRSxFQUFFO3dCQUN6QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNoQyxDQUFDO29CQUNELEtBQUssRUFBRTt3QkFDTCxLQUFLLEVBQUUsSUFBQSxjQUFPLEVBQUMsU0FBUyxDQUFDO3dCQUN6QixHQUFHLEVBQUUsSUFBQSxjQUFPLEVBQUMsU0FBUyxDQUFDO3dCQUN2QixJQUFJLEVBQUUsZ0JBQVE7cUJBQ2Y7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDbkMsUUFBUSxDQUFDLGNBQWMsQ0FDckIsSUFBQSxPQUFDLEVBQUMsS0FBSyxFQUFFO3dCQUNQLE1BQU07NEJBQ0osT0FBTyxJQUFBLE9BQUMsRUFBQyxLQUFLLEVBQUU7Z0NBQ2QsU0FBUyxFQUFFLEdBQUcsS0FBSyxFQUFFOzZCQUN0QixDQUFDLENBQUM7d0JBQ0wsQ0FBQztxQkFDRixDQUFDLENBQ0gsQ0FBQztnQkFDSixDQUFDO2FBQ0YsQ0FDRjtTQUNGLENBQUMsQ0FBQztRQUVILEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVaLE9BQU8sSUFBQSxPQUFDLEVBQUMsS0FBSyxFQUFFO1lBQ2QsUUFBUSxFQUFFO2dCQUNSLElBQUEsT0FBQyxFQUFDLEtBQUssRUFBRTtvQkFDUCxLQUFLLEVBQUU7d0JBQ0wsV0FBVyxFQUFFLE9BQU87d0JBQ3BCLFdBQVcsRUFBRSxNQUFNO3dCQUNuQixXQUFXLEVBQUUsT0FBTzt3QkFDcEIsS0FBSyxFQUFFLE9BQU87d0JBQ2QsTUFBTSxFQUFFLE9BQU87cUJBQ2hCO29CQUNELFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7aUJBQ3pCLENBQUM7YUFDSDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFDLENBQUM7QUFFSCxJQUFBLFdBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMifQ==