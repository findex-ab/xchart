import { X, mount } from "xel/lib";
import { xReactive } from 'xel/lib/utils/reactivity/reactive';
import { DonutSegment } from "./xchart/charts/donut/types";
import { clamp, range } from "./xchart/utils/etc";
import { floatBitsToUint, hashf, hashu32, toUint32 } from "./xchart/utils/hash";
import { VEC2 } from "./xchart/utils/vector";
import { Visd, VisdApp } from "./xchart/visd";
import { ChartData } from "./xchart/charts/types";
import { noise } from "./xchart/utils/noise";

const words = [
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

const generateData = (N: number) => {
  const SEED = 44.238812 + new Date().getTime();
  const values = range(N).map(
    (i) => 100.0 * noise(SEED + (10.048 * (i / N) + Math.cos((i / N) * 6.28)))
  );
  const data: ChartData = {
    values: values,
    labels: range(N).map((i) => {
      const idx = hashu32(i);
      return words[idx % words.length];
    }),
  };

  return data;
};

interface AppState {
  visd: any;
  data: ChartData;
  N: number;
}

const MIN = 4;
const MAX = 500;
const INITIAL = 40;

let oldVisd: any = undefined;

const App = X<{}, AppState>("div", {
  initialState: {
    visd: null,
    data: generateData(8),
    N: INITIAL,
  },
  onUpdate: (x) => {
    if (oldVisd) {
      oldVisd.stop();
      oldVisd = undefined;
    }
    const visd = oldVisd || VisdApp({
      resolution: VEC2(1280, 720),
      container: document.getElementById("plot"),
    });

    visd.stop();
    oldVisd = visd;

    visd.start(
      visd.charts.line(generateData(x.state.N), {
        callback: (value: number) => {
          visd.setTooltipBody(
            X("div", {
              style: {
                fontSize: "1.5rem",
              },
              innerText: `${value.toFixed(3)}`,
            })
          );
        },
      })
    );
  },
  render(props, state) {
    const Plot = X("div", { id: "plot" });


    const Slider = X<{}, { value: number }>("div", {
      initialState: {
        value: state.N
      },
      render(props, localState) {
        //const pEl = xRef<XElement | undefined>(undefined, (xel) => {
        //  if (!xel) return;
        //  if (!xel.el) return;
        //});
        
        return () => X("div", {
          children: [
            X("p", {
              innerText: `${localState.value}`,
         //     ref: pEl
            }),
            X("input", {
              type: "range",
              value: props.value,
              min: MIN,
              max: MAX,
              oninput: (event: InputEvent & { target: { value: string } }) => {
                const value = parseFloat(event.target.value);
                localState.value = Math.round(value);
                //if (pEl.value && pEl.value.el) {
                //  const ee =pEl.value.el as HTMLElement;
                //  ee.innerText = `${localState.value}`;
                //}
              },
              onchange: () => {
                state.N = localState.value;
              }
            }),
          ],
        });
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
