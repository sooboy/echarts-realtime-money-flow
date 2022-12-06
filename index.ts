import dayjs from "dayjs";
import { filter, interval, map, mergeMap, Subject, take } from "rxjs";
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

interval(1000 * updateTime)
	.pipe(
		filter((_) => {
			const now = dayjs(new Date()).format("HH:mm:ss");

			return (
				(now >= "09:30:00" && now <= "11:30:00") ||
				(now >= "13:00:00" && now <= "15:00:00")
			);
		})
	)
	.pipe(mergeMap(async (_) => await listData()))
	.subscribe((data) => {
		updateFn(data.time, data.category, data.series);
		dataset.addData(data.category, data.series);
		const fiveDiff = dataset.data((minte * 60) / updateTime);
		updateFn2(data.time, fiveDiff.category, fiveDiff.series);

		// const sorted = dataset.addDataIndex(data.category, data.series);
		// dataset.printChance(minte * 60 / updateTime,data.time,sorted)
        
		dataset.addDataIndex(data.category, data.series);
		const sorted2 = dataset
			.merge(fiveDiff.category, fiveDiff.series)
			.sort((a, b) => b.value - a.value);
		dataset.printChance((minte * 60) / updateTime, data.time, sorted2);
	});
