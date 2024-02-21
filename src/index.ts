import { X, mount } from "xel";
import { DonutSegment } from "./xchart/charts/donut/types";
import { clamp, range } from "./xchart/utils/etc";
import { floatBitsToUint, hashf, hashu32, toUint32 } from "./xchart/utils/hash";
import { VEC2 } from "./xchart/utils/vector";
import { Visd, VisdApp, VisdApplication } from "./xchart/visd";
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

const V = VisdApp({
  size: VEC2(1280, 720),
  resolution: VEC2(1280, 720),
  container: document.getElementById("app"),
});

V.insert({
  uid: "linechart123",
  config: {
    resolution: VEC2(1280, 720),
    size: VEC2(1280, 720),
  },
  fun: V.charts.line(generateData(10), {
    autoFit: true,
    callback: (instance, value, index) => {
      instance.setTooltipBody(
        X("div", {
          innerText: `${value.toFixed(2)}`,
        })
      );
    },
  }),
});

V.insert({
  uid: "donut1112312",
  config: {
    resolution: VEC2(1280, 720),
    size: VEC2(1280, 720),
  },
  fun: V.charts.donut(generateData(10), {
    autoFit: true,
    callback: (instance, value, index) => {
      instance.setTooltipBody(
        X("div", {
          innerText: `${value.toFixed(2)}`,
        })
      );
    },
  }),
});

V.start();
