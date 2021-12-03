import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import { ERecordingError, IRecordingError } from '../types/clipper.types';

import * as clips from './clips';

async function startArchive() {
	if (clips.isRecording()) return;

	try {
		// build demo name
		const dateString = new Date().toISOString().slice(0, 10);

		let demoName = `${dateString}_${gamestate.state.map.name}`;
		demoName = clips.fixDuplicateDemoName(demoName, config.paths.archives);

		// record archive
		const archivePath = path.join(config.paths.demos, config.paths.archives);

		await clips.recordDemo(path.join(archivePath, demoName));
		clips.onRecordingStart(demoName);
	} catch (e) {
		if (e instanceof IRecordingError) {
			switch (e.code) {
				case ERecordingError.ALREADY_RECORDING: {
					netcon.echo('You are already recording a demo.');
					break;
				}
			}
		} else throw e;
	}
}

export function initialise() {
	// start recording either in warmup or in a freezetime
	gamestate.on('map.phase', async ({ value }) => {
		if (value == 'warmup') await startArchive();
	});

	gamestate.on('round.phase', async ({ value }) => {
		if (value == 'freezetime') await startArchive();
	});
}
