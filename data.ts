export class Data {
	private _data: Map<string, number[]> = new Map();
	private _dataIndex: Map<string, number[]> = new Map();
	private _chance: Map<string, string[]> = new Map();
	public addData(category: string[], series: number[]) {
		if (category.length !== series.length) {
			return;
		}
		category.forEach((value, index) => {
			if (this._data.has(value)) {
				this._data.get(value)?.push(series[index]);
			} else {
				this._data.set(value, [series[index]]);
			}
		});
	}

	public addDataIndex(category: string[], series: number[]) {
		const sorted = this.merge(category, series).sort(
			(a, b) => b.value - a.value
		);
		sorted.forEach((value, index) => {
			if (this._dataIndex.has(value.category)) {
				this._dataIndex.get(value.category)?.push(index);
			} else {
				this._dataIndex.set(value.category, [index]);
			}
		});
		return sorted;
	}

	public printChance(
		num: number,
		time: string,
		chance: {
			category: string;
			value: number;
		}[]
	) {
		chance.slice(0, 10).forEach((item) => {
			const list = this._dataIndex.get(item.category) ?? [];
			const listLimit = list.length - num > 0 ? list.slice(-num) : list;
			const min = Math.min(...listLimit);
			const max = Math.max(...listLimit);
            // console.log(item.category,list)

            const current = listLimit[listLimit.length - 1];
			if (
				min === current &&
				max - min > 0 &&
				listLimit.length > 2 &&
				current !==
					listLimit[listLimit.length - 2]  &&
                (max -min >5 || current < 10)
			) {
                const msg = `${time} - ${item.category} 提升了 ${
                    max - min
				}名,当前排名:${listLimit[listLimit.length - 1]}`;
                
				const list = this._chance.get(item.category) ?? [];
				list.push(msg);
				this._chance.set(item.category, list);
                
                console.log(`${time} - %c${item.category} %c提升了 ${max - min} 名 %c,%c当前排名:${listLimit[listLimit.length - 1]}`,"font-weight:bold",max-min >10 ?`background: black;color:white;padding:2px`:`background: red;color:white;padding:2px`,null,"background:red;color:white;padding:2px");
                console.dir(list,{depth:null})
			}
		});
	}

	public data(num: number) {
		const category: string[] = [];
		const series: number[] = [];
		this._data.forEach((value, key) => {
			category.push(key);
			series.push(
				value.length - num >= 0
					? value[value.length - 1] - value[value.length - num]
					: value[value.length - 1]
			);
		});
		return { category, series };
	}

	public merge(category: string[], series: number[]) {
		return category.map((category, index) => ({
			category,
			value: series[index],
		}));
	}
}
