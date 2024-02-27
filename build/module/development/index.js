import { X, mount } from 'xel';
import { VEC2, VisdApp, lerp, noise, range } from '../xchart';
import * as fns from 'date-fns';
import data_ from '../data/data.json';
import { maxDate, minDate } from '../xchart/utils/date';
export const ONE_MINUTE = 1000 * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_WEEK * 4;
export const ONE_YEAR = ONE_MONTH * 12;
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
const data = data_;
const App = X('div', {
    style: {},
    render() {
        const vis = VisdApp({
            container: document.body,
        });
        const resolution = VEC2(640, 480).scale(1.5);
        const sortedData = mergePerformanceData(data).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const dataDates = sortedData.map((it) => new Date(it.date));
        const dataValues = sortedData.map((it) => it.accMonetaryPerf);
        const N = 2500;
        const dates = range(N).map((i) => new Date(Math.floor(lerp(2000, 2024, i / N)) + '-01-01')); //sortedData.map((it) => new Date(it.date));
        const values = range(N).map((i) => noise((i / N) * 300.0312)); //sortedData.map((it) => it.accMonetaryPerf);
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
                        start: minDate(dataDates),
                        end: maxDate(dataDates),
                        step: ONE_YEAR,
                    },
                },
                callback: (instance, value, index) => {
                    instance.setTooltipBody(X('div', {
                        render() {
                            return X('div', {
                                innerText: `${value}`,
                            });
                        },
                    }));
                },
            }),
        });
        vis.start();
        return X('div', {
            children: [
                X('div', {
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
mount(App, { target: document.getElementById('app') });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGV2ZWxvcG1lbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDL0IsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFOUQsT0FBTyxLQUFLLEdBQUcsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUM7QUFDdEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUV4RCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNwQyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN4QyxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNyQyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUN0QyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQVl2QyxTQUFTLG9CQUFvQixDQUMzQixJQUF1QjtJQUV2QixNQUFNLGFBQWEsR0FBeUMsRUFBRSxDQUFDO0lBRS9ELHNCQUFzQjtJQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDcEIsK0NBQStDO1FBQy9DLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FB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