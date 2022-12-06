import axios from "axios";

declare module List {
	export interface Diff {
		f12: string;
		f13: number;
		f14: string;
		f62: number;
	}

	export interface Data {
		total: number;
		diff: Diff[];
	}

	export interface RootObject {
		rc: number;
		rt: number;
		svr: number;
		lt: number;
		full: number;
		dlmkts: string;
		data: Data;
	}
}

declare module Flow {
	export interface Period {
		b: any;
		e: any;
	}

	export interface TradePeriods {
		pre?: any;
		after?: any;
		periods: Period[];
	}

	export interface Data {
		code: string;
		market: number;
		name: string;
		tradePeriods: TradePeriods;
		klines: string[];
	}

	export interface RootObject {
		rc: number;
		rt: number;
		svr: number;
		lt: number;
		full: number;
		dlmkts: string;
		data: Data;
	}
}

const fetch = async <T>(url: string) => {
	const data = await axios.get<T>(url);
	const json = data.data as T;
	return json;
};
// https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&fields=f12%2Cf13%2Cf14%2Cf62&fid=f62&fs=m%3A90%2Bt%3A2&ut=b2884a393a59ad64002292a3e90d46a5
const list = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&fields=f12%2Cf13%2Cf14%2Cf62&fid=f62&fs=m%3A90%2Bt%3A2&ut=b2884a393a59ad64002292a3e90d46a5`;
// fetch<List.RootObject>(list).then(data => console.log(data.data.diff))
const codeList = async (url: string) => {
	const list = await fetch<List.RootObject>(url);
	const codes = list.data.diff.map((item) => ({
		code: `${item.f13}.${item.f12}`,
		name: item.f14,
	}));
	return codes;
};
// codeList(list).then(console.log)

//https://push2.eastmoney.com/api/qt/stock/fflow/kline/get?lmt=0&klt=1&fields1=f1%2Cf2%2Cf3%2Cf7&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61%2Cf62%2Cf63%2Cf64%2Cf65&ut=b2884a393a59ad64002292a3e90d46a5&secid=90.BK1042
const flow = (code: string) =>
	`https://push2.eastmoney.com/api/qt/stock/fflow/kline/get?lmt=0&klt=1&fields1=f1%2Cf2%2Cf3%2Cf7&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61%2Cf62%2Cf63%2Cf64%2Cf65&ut=b2884a393a59ad64002292a3e90d46a5&secid=${code}`;

const deal = (data: Flow.RootObject) =>
	data.data.klines.map<[string,number]>((item) => {
		const it = item.split(",");
		const time = it[0];
		const price = Number(it[1]);
		return [time, price];
	});

const flowData = (code: string) =>
	fetch<Flow.RootObject>(flow(code)).then(deal);

// flowData("90.BK1042").then(console.log);
// codeList(list).then((codes) =>codes.map(flowData))
const dealFlow = async () => {
	const codes = await codeList(list);
	const data = await Promise.all(
		codes.map(async (code) => {
			const data = await flowData(code.code);
			return {
				code,
				data,
			};
		})
	);
	return data;
};

export const sleep = async (time: number) => {
	return new Promise((resolve) => {
		setTimeout(() => {
            console.log("sleep!")
			resolve(null);
		}, time);
	});
};

export const reset = (data: number[][]) => {
	if (data[0].length !== data[1].length || data[0].length < 1) return [];
	return data[0].map(function (_, i) {
		return data.map(function (row) {
			return row[i];
		});
	});
};

// const dd = [
//     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
//     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// ]
// console.log(reset(dd))

export const dealData = async () => {
    const data = await dealFlow();
    const category = data.map(it=>it.code.name)
    const series = reset(data.map(it=>it.data.map(item=>item[1])))
    const times = data.map(it=>it.data.map(item=>item[0]))[0]
    return {
        category,
        times,
        series
    }
}

