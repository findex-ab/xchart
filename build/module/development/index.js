import { X, mount } from 'xel';
import { VEC2, VisdApp, noise, range } from '../xchart';
import * as fns from 'date-fns';
const randomItem = (seed) => {
    const date = new Date(new Date().getTime() + 50000000 * seed);
    return {
        value: (noise(seed) * 1000) + 500 * (noise((seed + 3.39182) * 2)),
        date: date,
    };
};
const N = 500;
const F = 10;
const data = range(N)
    .map((i) => randomItem((i / N) * F))
    .sort((a, b) => fns.compareAsc(a.date, b.date));
const SIZE = VEC2(640, 480).scale(1.6);
const visd = VisdApp({
    container: document.body,
});
const App = X('div', {
    style: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    children: [
        X('div', {
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
                        aspectRatio: VEC2(16, 9)
                    },
                    fun: visd.charts.line({
                        values: data.map((it) => it.value),
                        dates: data.map((it) => it.date),
                    }, {
                        callback(instance, key, value, index) {
                            instance.setTooltipBody(X('div', {
                                children: [
                                    X('p', { innerText: fns.format(key, 'dd MMM, yyy') }),
                                    X('p', { innerText: value })
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
mount(App, { target: document.getElementById('app') });
