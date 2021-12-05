import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { ClipMode } from '../../config';
import * as demo from '../../util/demo';
import * as util from '../../util/util';

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

apiRouter.post('/update-infos', async (req, res) => {
	const update = async (mode: ClipMode) => {
		const demoInfosPath = util.getBaseDemoInfoPath(mode);
		await fs.ensureDir(demoInfosPath);

		const demos = await util.getDemoFilenames(mode);
		console.log(`updating ${demos.length} demos (${mode})`);

		for (const demoFilename of demos) {
			const demoPath = util.getDemoPath(mode, demoFilename);
			const demoInfoPath = util.getDemoInfoPath(mode, demoFilename);

			if (!fs.existsSync(demoInfoPath)) {
				// haven't parsed this demo yet.
				const demoInfo = await demo.parseDemo(demoPath);
				await fs.writeJSON(demoInfoPath, demoInfo);
				console.log('updated info for ', demoFilename);
			}
		}

		console.log('done');
	};

	await update('clipper');
	await update('archiver');

	return res.json({ success: true });
});

export default apiRouter;
