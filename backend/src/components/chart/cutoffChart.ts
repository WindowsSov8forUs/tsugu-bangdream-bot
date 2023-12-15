import { createCanvas } from 'canvas';
import { Cutoff } from "@/types/Cutoff";
import { drawTimeLineChart } from "@/components/chart_Timeline";
import { Event } from '@/types/Event';
import { Server } from '@/types/Server';
import { EventTop } from '@/types/EventTop';
import { getColor } from '@/components/utils'

export async function drawCutoffChart(cutoffList: Cutoff[], setStartToZero = false, server: Server = Server['jp']) {
    //setStartToZero:是否将开始时间设置为0
    var datasets = []
    var time = new Date().getTime()
    if (cutoffList.length == 0) {
        return (createCanvas(1, 1))
    }
    var onlyOne = cutoffList.length == 1
    for (let i = 0; i < cutoffList.length; i++) {

        const cutoff = cutoffList[i];

        let lableName: string
        if (setStartToZero) {
            const tempEvent = new Event(cutoff.eventId)
            lableName = `[${tempEvent.eventId}] ${tempEvent.eventName[server]} T${cutoff.tier}`
        }
        else {
            lableName = `T${cutoff.tier}`
        }
        datasets.push({
            label: lableName,
            data: cutoff.getChartData(setStartToZero),
            borderWidth: 5,
            borderColor: [getColor(i, 1).rgbaData],
            backgroundColor: [getColor(i, 0.2).rgbaData],
            pointBackgroundColor: getColor(i, 1).rgbaData,
            pointBorderColor: getColor(i, 1).rgbaData,
            fill: onlyOne
        })

        if (cutoff.status == 'in_progress') {
            if (cutoff.predictEP != null && cutoff.predictEP != 0) {
                let data = []
                if (setStartToZero) {
                    data = [{ x: new Date(0), y: cutoff.predictEP }, { x: new Date(cutoff.endAt - cutoff.startAt), y: cutoff.predictEP }]
                }
                else {
                    data = [{ x: new Date(cutoff.startAt), y: cutoff.predictEP }, { x: new Date(cutoff.endAt), y: cutoff.predictEP }]
                }
                datasets.push({
                    label: `T${cutoff.tier} 预测线`,
                    borderColor: [getColor(i, 1).rgbaData],
                    backgroundColor: [getColor(i, 1).rgbaData],
                    data: data,
                    borderWidth: 5,
                    borderDash: [20, 10],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                })


            }

        }
    }
    if (!setStartToZero) {
        if (time < cutoffList[0].endAt) {
            datasets.push({
                label: "当前时间",
                borderColor: [getColor(0, 1).rgbaData],
                backgroundColor: [getColor(0, 1).rgbaData],
                data: [{ x: new Date(time), y: 0 }],
                fill: false,
                pointRadius: 10,
                pointHoverRadius: 15,
                showLine: false
            })
        }
    }

    var data = {
        datasets: datasets
    }
    if (setStartToZero) {
        let longestTime = 0
        for (let i = 0; i < cutoffList.length; i++) {
            const cutoff = cutoffList[i];
            if (cutoff.endAt - cutoff.startAt > longestTime) {
                longestTime = cutoff.endAt - cutoff.startAt
            }
        }
        return await drawTimeLineChart({ data, start: new Date(0), end: new Date(longestTime), setStartToZero })
    }
    else {
        return await drawTimeLineChart({ data, start: new Date(cutoffList[0].startAt), end: new Date(cutoffList[0].endAt), setStartToZero })
    }

}
export async function drawEventTopChart(eventTop: EventTop, setStartToZero = false, server: Server = Server['jp']) {
    var datasets = []
    if (eventTop == undefined) {
        return (createCanvas(1, 1))
    }
    var allData = eventTop.getChartData();
    function removeBraces(text: string): string {
        var newText = text.replace(/\[[^\]]*\]/g, "");
        return newText;
    }
    for (const key in allData) {
        const tempColor = getColor(0, 1).rgbaData;
        datasets.push({
            label: removeBraces(eventTop.getUserNameById(Number(key))),
            data: allData[key],
            borderWidth: 4,
            borderColor: [getColor(0, 1).rgbaData],
            backgroundColor: [getColor(0, 0.2).rgbaData],
            pointBackgroundColor: getColor(0, 0).rgbaData,
            pointBorderColor: getColor(0, 0).rgbaData,
            pointStyle: false,
            fill: false
        })
    }
    var data = { datasets: datasets }
    return await drawTimeLineChart({ data, start: new Date(eventTop.startAt), end: new Date(eventTop.endAt), setStartToZero })
}