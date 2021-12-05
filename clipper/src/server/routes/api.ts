import express from 'express';
import { body, query } from 'express-validator';
import netcon from '../../connections/netcon';
import * as util from '../../util/util';
import validate from '../util/validate';

const apiRouter = express.Router();

apiRouter.get('/get-demos', async (req, res) => {
	const clips = await util.getDemos('clipper');
	console.log(clips);

	const archives = await util.getDemos('archiver');
	console.log(archives);

	return res.json({
		clips,
		archives,
	});
});

apiRouter.post('/parse-demos', async (req, res) => {
	await util.parseDemos();

	return res.json({ success: true });
});

apiRouter.post(
	'/parse-demo',
	body('mode').isString(),
	body('demoName').isString(),
	async (req, res) => {
		const { mode, demoName } = validate(req);

		await util.parseDemo(mode, demoName, false);

		return res.json({ success: true });
	}
);

apiRouter.post(
	'/play-demo',
	body('mode').isString(),
	body('demoName').isString(),
	async (req, res) => {
		const { mode, demoName } = validate(req);

		const demoPath = util.getDemoPath(mode, demoName);
		netcon.playDemo(demoPath);

		return res.json({ success: true });
	}
);

export default apiRouter;
