//import { X, mount } from 'xel';
//import { VEC2, VisdApp, lerp, noise, range } from '../xchart';
//import { RangeScalar } from '../xchart/types/range';
//import * as fns from 'date-fns';
//import data_ from './data/data.json';
//import { maxDate, minDate } from '../xchart/utils/date';
//
//export const ONE_MINUTE = 1000 * 60;
//export const ONE_HOUR = ONE_MINUTE * 60;
//export const ONE_DAY = ONE_HOUR * 24;
//export const ONE_WEEK = ONE_DAY * 7;
//export const ONE_MONTH = ONE_WEEK * 4;
//export const ONE_YEAR = ONE_MONTH * 12;
//
//interface PerformanceData {
//  date: string | Date;
//  accMonetaryPerf: number;
//  monetaryPerf: number;
//  accPctPerf: number;
//  pctPerf: number;
//  raw: string;
//  _id: string;
//}
//
//function mergePerformanceData(
//  data: PerformanceData[],
//): Partial<PerformanceData>[] {
//  const groupedByDate: { [key: string]: PerformanceData[] } = {};
//
//  // Group items by date
//  data.forEach((item) => {
//    // Convert the date to a string to use as a key
//    const dateKey = new Date(item.date).toISOString().split('T')[0];
//    if (!groupedByDate[dateKey]) {
//      groupedByDate[dateKey] = [];
//    }
//    groupedByDate[dateKey].push(item);
//  });
//
//  // Merge items by summing their values
//  const mergedData: Partial<PerformanceData>[] = Object.keys(groupedByDate).map(
//    (date) => {
//      const sum = groupedByDate[date].reduce(
//        (acc, curr) => acc + curr.accMonetaryPerf,
//        0,
//      );
//      return {
//        date: new Date(date),
//        accMonetaryPerf: sum,
//      };
//    },
//  );
//
//  return mergedData;
//}
//
//const data = data_ as PerformanceData[];
//
//const App = X('div', {
//  style: {},
//  render() {
//    const vis = VisdApp({
//      container: document.body,
//    });
//
//    const resolution = VEC2(640, 480).scale(1.5);
//
//    const sortedData = mergePerformanceData(data).sort((a, b) => {
//      return new Date(a.date).getTime() - new Date(b.date).getTime();
//    });
//
//    const dataDates = sortedData.map((it) => new Date(it.date));
//    const dataValues = sortedData.map((it) => it.accMonetaryPerf);
//
//    const N = 2500;
//    const dates = range(N).map(
//      (i) => new Date(Math.floor(lerp(2000, 2024, i / N)) + '-01-01'),
//    ); //sortedData.map((it) => new Date(it.date));
//    const values = range(N).map((i) => noise((i / N) * 300.0312)); //sortedData.map((it) => it.accMonetaryPerf);
//
//    const instance = vis.insert({
//      uid: '5492',
//      config: {
//        onlyActiveWhenMouseOver: true,
//        fitContainer: true,
//        resolution: resolution,
//        size: resolution,
//        minTooltipOpacity: 1,
//        sizeClamp: {
//          min: resolution,
//          max: resolution,
//        },
//      },
//      fun: vis.charts.line(
//        {
//          values: dataValues,
//          //labels: items.value.map(t => t.date.toString())
//        },
//        {
//          autoFit: false,
//          drawLabels: true,
//          drawPoints: true,
//          fitContainer: true,
//          padding: 0.0003,
//          smoothPath: true,
//          fontSize: '1rem',
//          thick: 4,
//          xAxis: {
//            format: (x: RangeScalar) => {
//              return fns.format(x, 'y-m-d');
//            },
//            range: {
//              start: minDate(dataDates),
//              end: maxDate(dataDates),
//              step: ONE_YEAR,
//            },
//          },
//          callback: (instance, value, index) => {
//            instance.setTooltipBody(
//              X('div', {
//                render() {
//                  return X('div', {
//                    innerText: `${value}`,
//                  });
//                },
//              }),
//            );
//          },
//        },
//      ),
//    });
//
//    vis.start();
//
//    return X('div', {
//      children: [
//        X('div', {
//          style: {
//            borderStyle: 'solid',
//            borderWidth: '2px',
//            borderColor: 'black',
//            width: '640px',
//            height: '480px'
//          },
//          children: [instance.xel],
//        }),
//      ],
//    });
//  },
//});
//
//mount(App, { target: document.getElementById('app') });
