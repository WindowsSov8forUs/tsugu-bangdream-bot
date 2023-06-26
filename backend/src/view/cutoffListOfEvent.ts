import { Event } from '../types/Event';
import { drawList, line } from '../components/list';
import { drawDatablock } from '../components/dataBlock'
import { Image, Canvas, createCanvas, loadImage } from 'canvas'
import { changeTimefomant } from '../components/list/time';
import { Server } from '../types/Server';
import { drawTitle } from '../components/title'
import { outputFinalBuffer } from '../image/output'
import { Cutoff } from "../types/Cutoff";
import { drawCutoffChart } from '../components/chart/cutoffChat'
import { serverNameFullList, tierListOfServer } from '../config';
import { drawEventDatablock } from '../components/dataBlock/event';
import { drawTips } from '../components/tips'
import { assetsRootPath } from '../config';
import * as path from 'path'


var statusName = {
    'not_start': '未开始',
    'in_progress': '进行中',
    'ended': '已结束'
}

export async function drawCutoffListOfEvent(eventId: number, server: Server): Promise<Array<Buffer | string>> {
    var event = new Event(eventId)
    if (!event.isExist) {
        return ['活动不存在']
    }
    if (event.startAt[server] == undefined) {
        return ['活动在该服务器不存在']
    }
    var all = []
    all.push(drawTitle('档线列表', `${serverNameFullList[server]}`))
    all.push(await drawEventDatablock(event))

    const list: Array<Image | Canvas> = []
    //状态
    var time = new Date().getTime()
    var status = ''
    if (time < event.startAt[server]) {
        status = 'not_start'
    }
    else if (time > event.endAt[server]) {
        status = 'ended'
    }
    else {
        status = 'in_progress'
    }
    list.push(drawList({
        key: '状态',
        text: statusName[status]
    }))
    list.push(line)

    //初始化档线列表
    var tierList = tierListOfServer[Server[server]]
    var cutoffList: Array<Cutoff> = []
    for (var i in tierList) {
        var tempCutoff = new Cutoff(eventId, server, tierList[i])
        await tempCutoff.initFull()
        if (tempCutoff.status == 'in_progress') {
            tempCutoff.predict()
        }
        cutoffList.push(tempCutoff)
    }
    //每个档线详细数据
    for (var i in cutoffList) {
        const cutoff = cutoffList[i]
        let cutoffContent: string[] = []
        if (cutoff.status == 'in_progress') {
            let predictText: string
            if (cutoff.predictEP == null || cutoff.predictEP == 0) {
                predictText = '?'
            }
            else {
                predictText = cutoff.predictEP.toString()
            }
            cutoffContent.push(`当前预测线: ${predictText}\n`)
            cutoffContent.push(`最新分数线: ${cutoff.latestCutoff.ep.toString()}\n`)
            cutoffContent.push(`更新时间:${changeTimefomant(cutoff.latestCutoff.time)}`)
        }
        else if (cutoff.status == 'ended') {
            cutoffContent.push(`最终分数线:${cutoff.latestCutoff.ep.toString()}\n`)
        }


        list.push(drawList({
            key: `T${cutoff.tier}`,
            content: cutoffContent
        }))
        list.push(line)
    }
    list.pop()
    list.push(createCanvas(800, 50))

    //折线图
    list.push(await drawCutoffChart(cutoffList))

    //创建最终输出数组
    var listImage = drawDatablock({ list })

    all.push(listImage)

    all.push(drawTips({
        text: '想给我们提供数据?\n可以在B站 @Tsugu_Official 的置顶动态留言\n或者在群238052000中提供数据\n也可以扫描右侧二维码进行上传\n手机可以长按图片扫描二维码\n我们会尽快将数据上传至服务器',
        image: await loadImage(path.join(assetsRootPath, 'shimowendang.png'))
    }))

    var buffer = await outputFinalBuffer({
        imageList: all,
        useEasyBG: true
    })
    return [buffer]
}