import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import recording from './recording';
import * as util from '../util/util';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';

async function startArchive() {
	if (recording.isRecording()) return;

	try {
		// build demo name
		const dateString = new Date().toISOString().slice(0, 10);

		let demoName = `${dateString}_${gamestate.state.map.name}`;
		demoName = recording.fixDuplicateDemoName(demoName, 'archiver');

		// record archive
		const archivePath = util.getBaseDemoPath('archiver');

		await recording.recordDemo(path.join(archivePath, demoName));
		recording.onRecordingStart(demoName);
	} catch (e) {
		if (e instanceof IRecordingError) {
			switch (e.code) {
				case ERecordingError.RECORD_ALREADY_RECORDING: {
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
