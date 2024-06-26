import { body, validationResult } from 'express-validator';
import { drawGachaDetail } from '@/view/gachaDetail';
import { getServerByServerId, Server } from '@/types/Server';
import { listToBase64, isServerList } from '@/routers/utils';
import express from 'express';

const router = express.Router();

router.post('/', [
    // Add validation rules for each parameter
    body('default_servers').custom((value) => isServerList(value)),
    body('gachaId').isInt(),
    body('useEasyBG').isBoolean(),
    body('compress').optional().isBoolean(),
], async (req, res) => {
    console.log(req.ip,`${req.baseUrl}${req.path}`, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send([{ type: 'string', string: '参数错误' }]);
    }

    const { default_servers, gachaId, useEasyBG, compress } = req.body;

    try {
        const result = await commandGacha(default_servers, gachaId, useEasyBG, compress);
        res.send(listToBase64(result));
    } catch (e) {
        console.log(e);
        res.send([{ type: 'string', string: '内部错误' }]);
    }
});

export async function commandGacha(default_servers: Server[], gachaId: number, useEasyBG: boolean, compress: boolean): Promise<Array<Buffer | string>> {
    
    for(let i = 0; i < default_servers.length; i++) {
        default_servers[i] = getServerByServerId(default_servers[i])
    }
    return await drawGachaDetail(gachaId, default_servers, useEasyBG, compress)

}

export { router as searchGachaRouter }