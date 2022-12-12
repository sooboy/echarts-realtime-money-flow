import { bufferCount, filter, interval, map, mergeMap, Subject, take } from "rxjs";
import { createChart } from "../chart";
import { Data } from "../data";

import datas from "./updateData/data.json";

const updateTime = 5;
const minte = 5;

const updateFn = createChart(updateTime);
const updateFn2 = createChart(updateTime, `对比${minte}分钟前`);

const dataset = new Data();

let stop = false;
document.addEventListener("keyup", (event) => {
	if (event.code === "Space") {
		stop = !stop;
	}
});

// interval(1000* updateTime ).pipe(
//     filter(_=> !stop)
// ).pipe(
//     take(datas.series.length),
//     mergeMap(async (_,index) => ({
//         time:datas.times[index],
//         category:datas.category,
//         series:datas.series[index]
//     })),
// ).subscribe(data=>{
//     updateFn(data.time,data.category,data.series)
//     dataset.addData(data.category,data.series)
//     const fiveDiff = dataset.data(5)
//     updateFn2(data.time,fiveDiff.category,fiveDiff.series)

//     const sorted = dataset.addDataIndex(data.category, data.series);
//     // dataset.printChance(5,data.time,sorted)

//     const sorted2 = dataset.merge(fiveDiff.category, fiveDiff.series).sort((a,b)=>b.value -a.value)
//     dataset.printChance(5,data.time,sorted2)
// })

type DataFlow = {
    category: string[];
    series: number[];
    time: string;
}

const dataFlow = interval(1000 * updateTime)
	.pipe(filter((_) => !stop))
	.pipe(
		take(datas.series.length),
		mergeMap(async (_, index) => ({
			time: datas.times[index],
			category: datas.category,
			series: datas.series[index],
		}))
	);

// 添加数据
dataFlow.subscribe((data) => {
    dataset.addData(data.category, data.series);
	dataset.addDataIndex(data.category, data.series);
});

//  数据累计
dataFlow.subscribe((data) => {
	updateFn(data.time, data.category, data.series);
});

const deltaDataFlow = dataFlow.pipe(
	map((data) => {
		const fiveDiff = dataset.data(5);
		return {
			time: data.time,
			...fiveDiff,
		};
	})
);

//  5分钟涨跌幅
deltaDataFlow.subscribe((data) => {
	updateFn2(data.time, data.category, data.series);
});

// deltaDataFlow.subscribe((data) => {
// 	const sorted2 = dataset
// 		.merge(data.category, data.series)
// 		.sort((a, b) => b.value - a.value);
//     // console.log("5分钟涨跌幅", sorted2);
// 	dataset.printChance(5, data.time, sorted2);
// });

const deltaDataFlowN = (n:number) => deltaDataFlow.pipe(
    bufferCount(n,1)
)

const inflow = (data:number[]) => {
    if (data.length < 2)  return true;
    for(let i=1;i<data.length;i++){
        if(data[i] < data[i-1]) return false
    }
    return true
}
const up = (data:number[]) => data.every(predicate => predicate > 0);

const serialize = (data:DataFlow[])=>{
    const category = data[0].category
    const series = data.map(item=>item.series)
    const seriesLine = category.map((_,index)=>{
        return series.map(item=>item[index])
    })
    return {
        category,
        series:seriesLine
    }
}
const mapSeries :Map<string,string[]> = new Map();
deltaDataFlowN(5).subscribe((data) => {
    const serializeData = serialize(data);
    const series = serializeData.series
    // console.log("time is :",data[data.length -1].time)
    series.map((item,index)=>{
        if(inflow(item) && up(item)){
            const list = mapSeries.get(serializeData.category[index]) ?? [];
            list.push(`${data[data.length -1].time}`)
            mapSeries.set(serializeData.category[index],list);
            if(list.length >= 0){
                console.log(`${data[data.length -1].time} - `,serializeData.category[index],`触发了 ${list.length} 次`)
                console.log(list)
            }
        }
    })
})
