import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import recording from './recording';
import * as util from '../util/util';
import { getDateString } from '../util/helpers';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';

async function startArchive() {
	console.log('trying to start archive.');

	if (recording.isRecording()) return;

	try {
		// build demo name
		let demoName = `${getDateString()}_${gamestate.state.map.name}_${
			gamestate.state.map.mode
		}`;
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
		} else {
			console.log('unknown error.');
		}
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
