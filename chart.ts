import * as echarts from "echarts";

const option = (time: number,name:string = "对比"): echarts.EChartsOption => ({
	xAxis: {
		max: "dataMax",
	},
	yAxis: {
		type: "category",
		data: [],
		inverse: true,
		animationDuration: 300,
		animationDurationUpdate: 300,
		max: 20, // only the largest 3 bars will be displayed
	},
	series: [
		{
			realtimeSort: true,
			name: name,
			type: "bar",
			data: [],
			label: {
				show: true,
				position: "right",
				valueAnimation: true,
			},
		},
	],
	legend: {
		show: true,
	},
	animationDuration: time * 1000,
	animationDurationUpdate: time * 1000,
	animationEasing: "linear",
	animationEasingUpdate: "linear",
});

export const createChart = (updateTime: number,name:string = "对比") => {
	const chartDom = document.createElement("div");
	chartDom.style.display="inline-block";
    chartDom.style.width = "40%";
    chartDom.style.height = "1000px";
	document.body.appendChild(chartDom);
	const chart = echarts.init(chartDom);
	chart.setOption(option(updateTime,name));

	return (time: string, category: string[], series: number[]) => {
		chart.setOption<echarts.EChartsOption>({
            
			title: {
				text: time,
			},
			yAxis: {
				data: category,
			},
			series: [
				{
					type: "bar",
					data: series,
				},
			],
		});
	};
};
