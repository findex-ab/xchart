import { X, mount } from "xel";
import { VEC2, VisdApp, lerp, noise } from "../xchart";
import * as fns from 'date-fns';
import data_ from '../data/data.json';
import { getDatesBetween, maxDate, minDate } from '../xchart/utils/date';
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
const N = 60;
const FREQ = 2.3;
const randomDate = (seed) => {
    const r1 = noise(seed);
    seed += 23.8125;
    const r2 = noise(seed);
    seed += r1 + 11.2191;
    const r3 = noise(seed);
    seed += r3 + 6.44442;
    const year = Math.round(lerp(1999, 2024, r1, true));
    const month = Math.round(lerp(1, 12, r2, true));
    const day = Math.floor(lerp(1, 31, r3, true));
    const str = `${year}-${month}-${day}`;
    return new Date(str);
};
const randomValue = (seed, min = 0, max = 1) => {
    return lerp(min, max, noise(seed));
};
const App = X('div', {
    style: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    render() {
        const vis = VisdApp({
            container: document.body,
        });
        const size = VEC2(640, 480).scale(1.2);
        const resolution = size.scale(1.6);
        const sortedData = mergePerformanceData(data).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        const dates = getDatesBetween(new Date('2024-01-01'), new Date(), ONE_DAY);
        const values = dates.map((_, i) => {
            return noise((i / dates.length) * 10.291294) - 2.0 * noise(44.2981295 + (i / dates.length) * 15.291294);
        });
        //const dataDates = sortedData.map((it) => new Date(it.date));
        //const dataValues = sortedData.map((it) => it.accMonetaryPerf);
        //
        //const data2:DataType[] = range(N).map(i => {
        //  const u1 =         (i / N) * FREQ;
        //  const u2 = (u1 + 4.482185) * FREQ; 
        //  return {
        //    date: randomDate(u1),
        //    value: 100*randomValue(u2)
        //  }
        //}).sort((a, b) => fns.compareAsc(a.date, b.date));
        //const values = data2.map(d => d.value);
        //const dates = data2.map(d => d.date);
        const instance = vis.insert({
            uid: '5492',
            config: {
                onlyActiveWhenMouseOver: true,
                fitContainer: true,
                resolution: resolution,
                size: size,
                minTooltipOpacity: 1,
                sizeClamp: {
                    min: size,
                    max: resolution,
                },
            },
            fun: vis.charts.line({
                values: values,
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
                        return fns.format(x, 'H:m:s MMM E yy');
                    },
                    range: {
                        start: minDate(dates),
                        end: maxDate(dates),
                        step: 2_629_746_000,
                        array: dates
                    },
                    ticks: 6
                },
                callback: (instance, key, value, index) => {
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
                        borderWidth: '2px',
                        borderColor: 'black',
                        width: `${size.x}px`,
                        height: `${size.y}px`
                    },
                    children: [instance.xel],
                }),
            ],
        });
    },
});
mount(App, { target: document.getElementById('app') });
