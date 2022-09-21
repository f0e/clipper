import express from 'express';
import { query, body } from 'express-validator';
import config, { configValid, saveConfig, verifyCsgoPath } from '../../config';
import netcon from '../../connections/netcon';
import * as util from '../../util/util';
import * as helpers from '../../util/helpers';
import validate from '../util/validate';
import path from 'path';

const apiRouter = express.Router();

apiRouter.get('/get-demos', async (req, res) => {
	return res.json({
		clips: await util.getDemos('clipper'),
		archives: await util.getDemos('archiver'),
	});
});

apiRouter.get('/get-config', (req, res) => {
	return res.json(config);
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

		const demoPath = path.join(util.getBaseDemoPath(mode), demoName);
		netcon.playDemo(demoPath);

		return res.json({ success: true });
	}
);

apiRouter.post('/save-config', body('config').isObject(), async (req, res) => {
	const { config: newConfig } = validate(req);

	helpers.copyWithoutExtras(newConfig, config);
	await saveConfig();

	return res.json({ success: true });
});

apiRouter.get('/config-valid', async (req, res) => {
	return res.json(configValid);
});

apiRouter.get(
	'/csgo-path-valid',
	query('path').isString(),
	async (req, res) => {
		const { path: csgoPath } = validate(req);

		try {
			verifyCsgoPath(csgoPath);
			return res.json({
				valid: true,
			});
		} catch (e) {
			return res.json({
				valid: false,
				error: e.message,
			});
		}
	}
);

export default apiRouter;
