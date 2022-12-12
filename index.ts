import dayjs from "dayjs";
import { filter, interval, map, mergeMap, bufferCount } from "rxjs";
import { createChart } from "./chart";
import { Data } from "./data";

import { listData } from "./fetch";

const updateTime = 10;
const minte = 5;

const updateFn = createChart(updateTime);
const updateFn2 = createChart(updateTime, `对比${minte}分钟前`);

const dataset = new Data();

// interval(1000 * updateTime).pipe(
//     mergeMap(async _ => await listData()),
// ).subscribe(data=>{
//     updateFn(data.time,data.category,data.series)

//     dataset.addData(data.category,data.series)
//     const fiveDiff = dataset.data(minte * 60 / updateTime)
//     updateFn2(data.time,fiveDiff.category,fiveDiff.series)

//     const sorted = dataset.addDataIndex(data.category, data.series);
//     dataset.printChance(minte * 60 / updateTime,data.time,sorted)
// })

// interval(1000 * updateTime)
// 	.pipe(
// 		filter((_) => {
// 			const now = dayjs(new Date()).format("HH:mm:ss");

// 			return (
// 				(now >= "09:30:00" && now <= "11:30:00") ||
// 				(now >= "13:00:00" && now <= "15:00:00")
// 			);
// 		})
// 	)
// 	.pipe(mergeMap(async (_) => await listData()))
// 	.subscribe((data) => {
// 		updateFn(data.time, data.category, data.series);
// 		dataset.addData(data.category, data.series);
// 		const fiveDiff = dataset.data((minte * 60) / updateTime);
// 		updateFn2(data.time, fiveDiff.category, fiveDiff.series);

// 		// const sorted = dataset.addDataIndex(data.category, data.series);
// 		// dataset.printChance(minte * 60 / updateTime,data.time,sorted)

// 		dataset.addDataIndex(data.category, data.series);
// 		const sorted2 = dataset
// 			.merge(fiveDiff.category, fiveDiff.series)
// 			.sort((a, b) => b.value - a.value);
// 		dataset.printChance((minte * 60) / updateTime, data.time, sorted2);
// 	});

type DataFlow = {
    category: string[];
    series: number[];
    time: string;
}

const dataFlow = interval(1000 * updateTime)
	// .pipe(
	// 	filter((_) => {
	// 		const now = dayjs(new Date()).format("HH:mm:ss");

	// 		return (
	// 			(now >= "09:30:00" && now <= "11:30:00") ||
	// 			(now >= "13:00:00" && now <= "15:00:00")
	// 		);
	// 	})
	// )
	.pipe(mergeMap(async (_) => await listData()));

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
// 	dataset.printChance((minte * 60) / updateTime, data.time, sorted2);
// });

const deltaDataFlowN = (n: number) => deltaDataFlow.pipe(bufferCount(n, 1));

const inflow = (data: number[]) => {
	if (data.length < 2) return true;
	for (let i = 1; i < data.length; i++) {
		if (data[i] < data[i - 1]) return false;
	}
	return true;
};
const up = (data: number[]) => data.every((predicate) => predicate > 0);

const serialize = (data: DataFlow[]) => {
	const category = data[0].category;
	const series = data.map((item) => item.series);
	const seriesLine = category.map((_, index) => {
		return series.map((item) => item[index]);
	});
	return {
		category,
		series: seriesLine,
	};
};
const mapSeries: Map<string, string[]> = new Map();
deltaDataFlowN(5).subscribe((data) => {
	const serializeData = serialize(data);
	const series = serializeData.series;
	series.map((item, index) => {
		if (inflow(item) && up(item)) {
			const list = mapSeries.get(serializeData.category[index]) ?? [];
			list.push(`${data[data.length - 1].time}`);
			mapSeries.set(serializeData.category[index], list);
			console.log(
				`${data[data.length - 1].time} - `,
				serializeData.category[index],
				`触发了 ${list.length} 次`
			);
			console.log(list);
		}
	});
});
