import { filter, interval, map, mergeMap, Subject, take } from 'rxjs';
import { createChart } from '../chart';
import { Data } from '../data';

import datas from './updateData/data.json';

const updateTime = 3;
const minte = 5;

const updateFn = createChart(updateTime)
const updateFn2 = createChart(updateTime,`对比${minte}分钟前`)

const dataset = new Data()

let stop = false;
document.addEventListener('keyup',(event)=>{
    if (event.code === 'Space'){
        stop = !stop
    }
})

interval(1000* updateTime ).pipe(
    filter(_=> !stop)
).pipe(
    take(datas.series.length),
    mergeMap(async (_,index) => ({
        time:datas.times[index],
        category:datas.category,
        series:datas.series[index]
    })),
).subscribe(data=>{
    updateFn(data.time,data.category,data.series)
    dataset.addData(data.category,data.series)
    const fiveDiff = dataset.data(5)
    updateFn2(data.time,fiveDiff.category,fiveDiff.series)

    const sorted = dataset.addDataIndex(data.category, data.series);
    // dataset.printChance(5,data.time,sorted)


    const sorted2 = dataset.merge(fiveDiff.category, fiveDiff.series).sort((a,b)=>b.value -a.value)
    dataset.printChance(5,data.time,sorted2)
})