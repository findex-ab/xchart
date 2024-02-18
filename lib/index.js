import { X, mount } from "xel/lib";
import { range } from "./xchart/utils/etc";
import { hashu32 } from "./xchart/utils/hash";
import { VEC2 } from "./xchart/utils/vector";
import { VisdApp } from "./xchart/visd";
import { noise } from "./xchart/utils/noise";
var words = [
    "bitcoin",
    "ethereum",
    "stellar",
    "bitcoin cash",
    "doge coin",
    "dollar",
    "euro",
    "SEK",
];
//visd.start(visd.charts.donut(
//  {
//    values: range(N).map(i => hashf(13.492812*hashf(i+4.349281+Math.sin(i*6.28)))),
//    labels: range(N).map(i => words[i%words.length])
//  },
//  {},
//  (segment: DonutSegment) => {
//    visd.setTooltipBody(X('div', {
//      style: {
//        fontSize: '2rem'
//      },
//      innerText: `${segment.index}`
//    }))
//  }
//));
var generateData = function (N) {
    var SEED = 44.238812 + new Date().getTime();
    var values = range(N).map(function (i) { return 100.0 * noise(SEED + (10.048 * (i / N) + Math.cos((i / N) * 6.28))); });
    var data = {
        values: values,
        labels: range(N).map(function (i) {
            var idx = hashu32(i);
            return words[idx % words.length];
        }),
    };
    return data;
};
var MIN = 4;
var MAX = 500;
var INITIAL = 40;
var oldVisd = undefined;
var App = X("div", {
    initialState: {
        visd: null,
        data: generateData(8),
        N: INITIAL,
    },
    onUpdate: function (x) {
        if (oldVisd) {
            //oldVisd.stop();
            oldVisd = undefined;
        }
        var visd = oldVisd || VisdApp({
            size: VEC2(1280, 720),
            container: document.getElementById("plot"),
        });
        //visd.stop();
        oldVisd = visd;
        visd.start(visd.charts.donut(generateData(10), { thick: 1.35 }, function (segment) {
            visd.setTooltipBody(X('div', {
                style: {
                    fontSize: '2rem'
                },
                innerText: "".concat(segment.value)
            }));
        }));
        ;
        //    visd.start(
        //      visd.charts.line(generateData(x.state.N), {
        //        callback: (value: number) => {
        //          visd.setTooltipBody(
        //            X("div", {
        //              style: {
        //                fontSize: "1.5rem",
        //              },
        //              innerText: `${value.toFixed(3)} ASDASD`,
        //            })
        //          );
        //        },
        //      })
        //    );
    },
    render: function (props, state) {
        var Plot = X("div", { id: "plot" });
        var Slider = X("div", {
            initialState: {
                value: state.N
            },
            render: function (props, localState) {
                //const pEl = xRef<XElement | undefined>(undefined, (xel) => {
                //  if (!xel) return;
                //  if (!xel.el) return;
                //});
                return function () { return X("div", {
                    children: [
                        X("p", {
                            innerText: "".concat(localState.value),
                            //     ref: pEl
                        }),
                        X("input", {
                            type: "range",
                            value: props.value,
                            min: MIN,
                            max: MAX,
                            oninput: function (event) {
                                var value = parseFloat(event.target.value);
                                localState.value = Math.round(value);
                                //if (pEl.value && pEl.value.el) {
                                //  const ee =pEl.value.el as HTMLElement;
                                //  ee.innerText = `${localState.value}`;
                                //}
                            },
                            onchange: function () {
                                state.N = localState.value;
                            }
                        }),
                    ],
                }); };
            },
        });
        return X("div", {
            style: {
                display: "grid",
                gridTemplateColumns: "auto auto",
                width: "100%",
                height: "100%",
                padding: "3rem",
                gap: "1rem",
                marginTop: '5rem'
            },
            children: [
                Plot.call({}),
                X("div", {
                    children: [Slider.call({})],
                }),
            ],
        });
    },
});
mount(App, { target: document.getElementById("app") });
//# sourceMappingURL=index.js.map