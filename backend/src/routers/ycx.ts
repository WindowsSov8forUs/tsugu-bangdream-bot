import { drawCutoffDetail } from '@/view/cutoffDetail';
import { Server, getServerByServerId } from '@/types/Server';
import { getPresentEvent } from '@/types/Event';
import { listToBase64, isServer } from '@/routers/utils';
import { body, validationResult } from 'express-validator';
import express from 'express';
import { drawCutoffEventTop } from '@/view/cutoffEventTop';

const router = express.Router();

router.post(
    '/',
    [
        body('server').custom(isServer),
        body('tier').isInt(),
        body('eventId').optional().isInt(),
        body('compress').optional().isBoolean(),
    ],
    async (req, res) => {
        console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send([{ type: 'string', string: '参数错误' }]);
        }

        const { server, tier, eventId, compress } = req.body;

        try {
            const result = await commandYcx(getServerByServerId(server), tier, compress, eventId);
            res.send(listToBase64(result));
        } catch (e) {
            console.log(e);
            res.send([{ type: 'string', string: '内部错误' }]);
        }
    }
);

export async function commandYcx(server: Server, tier: number, compress: boolean, eventId?: number): Promise<Array<Buffer | string>> {
    if (!tier) {
        return ['请输入排名']
    }
    if (!eventId) {
        eventId = getPresentEvent(server).eventId
    }
    if(tier == 10){
        return await drawCutoffEventTop(eventId,server,compress);
    }
    return await drawCutoffDetail(eventId, tier, server, compress)

}

export { router as ycxRouter }