import axios from 'axios';
import dayjs from 'dayjs'

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

const fetch = async <T>(url: string) => {
	const data = await axios.get<T>(url);
	const json = data.data as T;
	return json;
};

const list = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&fields=f12%2Cf13%2Cf14%2Cf62&fid=f62&fs=m%3A90%2Bt%3A2&ut=b2884a393a59ad64002292a3e90d46a5`;

export const listData = async () => {
    const data = await fetch<List.RootObject>(list);
    const category = data.data.diff.map((item) => item.f14)
    const series = data.data.diff.map((item) => item.f62)
    return {
        time:dayjs().format('YYYY-MM-DD HH:mm:ss'),
        category,
        series
    }
}