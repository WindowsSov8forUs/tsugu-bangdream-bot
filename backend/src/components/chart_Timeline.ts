import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { assetsRootPath } from '@/config';
import { FontLibrary, loadImage } from 'skia-canvas';
import { assetErrorImageBuffer } from '@/image/utils';
import 'chartjs-adapter-moment';
FontLibrary.use("old", [`${assetsRootPath}/Fonts/old.ttf`])
var width = 800
var height = 900
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width, height, chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'old,Microsoft Yahei';
    }
});

interface drawTimeLineChartOptions {
    start: Date,
    end: Date,
    setStartToZero?: boolean,
    data: object,
}

export async function drawTimeLineChart({
    start,
    end,
    setStartToZero = false,
    data
}: drawTimeLineChartOptions,
    displayLable = false) {
    const yMax = Math.max(...data['datasets'].map((dataset: any) => Math.max(...dataset['data'].map((data: any) => data['y']))))
    var options = {
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20,
                    },
                },
                display: displayLable,
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                },
                min: start,
                max: end,
                display: !setStartToZero
            },
            y: {
                min: 0,
                max: (yMax + 1000) * 1.1,
            }
        }
    }
    const configuration = {
        type: 'line',
        data: data,
        options: options
    }
    try {
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration as any);
        return await loadImage(imageBuffer);
    }
    catch (e) {
        console.log(e)
        return loadImage(assetErrorImageBuffer)
    }
}