import fs from 'fs-extra';
import path from 'path';
import config, { ClipMode } from '../config';
import netcon from '../connections/netcon';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';

import * as clipper from './clipper';
import * as archiver from './archiver';
import * as util from '../util/util';

let recordingState = {
	recording: false,
};

let stoppingRecording = false;

export const isRecording = () => recordingState.recording;
export const forceStopRecording = () => (recordingState.recording = false);

export async function recordDemo(demoName: string) {
	return new Promise<void>(async (resolve, reject) => {
		// todo: better solution than this
		let success = false,
			fail = false,
			failReason: ERecordingError;

		const commandFail = (error: ERecordingError) => {
			if (success) return;

			fail = true;
			failReason = error;
		};

		const commandSuccess = () => {
			fail = false;
			success = true;
		};

		const waitForRecord = (message: string) => {
			const alreadyRecording = 'Already recording.';
			const waitForRoundOver =
				'Please start demo recording after current round is over.';
			const successRegex = /^Recording to (.*?)\.dem\.\.\.$/;

			if (message == alreadyRecording)
				return commandFail(ERecordingError.RECORD_ALREADY_RECORDING);

			if (message == waitForRoundOver)
				return commandFail(ERecordingError.RECORD_WAIT_FOR_ROUND_OVER);

			// check for recording
			const match = message.match(successRegex);
			if (match) {
				const recordingDemoName = match[1];
				if (recordingDemoName != demoName)
					return commandFail(ERecordingError.RECORD_RECORDING_DIFFERENT_DEMO);

				commandSuccess();
			}
		};

		await netcon.sendCommand(`record ${demoName}`, waitForRecord);

		if (success) return resolve();
		else if (fail) return reject(new IRecordingError(failReason));
		else return reject('unknown error');
	});
}

export async function stopRecordingDemo() {
	return new Promise<void>(async (resolve, reject) => {
		// todo: better solution than this
		let success = false,
			fail = false,
			failReason: ERecordingError;

		const commandFail = (error: ERecordingError) => {
			if (success) return;

			fail = true;
			failReason = error;
		};

		const commandSuccess = () => {
			fail = false;
			success = true;
		};

		const waitForRecord = (message: string) => {
			const successRegex =
				/^Completed demo, recording time (.*?), game frames (.*?)\.$/;
			const stopAtRoundEnd =
				'Demo recording will stop as soon as the round is over.';

			if (message == stopAtRoundEnd)
				return commandFail(ERecordingError.STOP_STOPPING_AT_END_ROUND);

			// check for recording
			const match = message.match(successRegex);
			if (match) {
				commandSuccess();
			}
		};

		stoppingRecording = true;
		await netcon.sendCommand('stop', waitForRecord);
		stoppingRecording = false;

		if (success) return resolve();
		else if (fail) return reject(new IRecordingError(failReason));
		else return reject(new IRecordingError(ERecordingError.STOP_NOT_RECORDING));
	});
}

export function onRecordingStart(demoName: string) {
	if (!recordingState.recording) {
		// update recording state
		netcon.echo(`Recording demo '${demoName}'...`);
		recordingState.recording = true;
	}
}

export async function onRecordingStop() {
	if (stoppingRecording) return; // already handling.

	if (recordingState.recording) {
		recordingState.recording = false;
		netcon.echo('Stopped recording demo');

		// mode-specific functions
		if (config.main.clip_mode == 'clipper') {
			await clipper.saveClip();
		}

		// parse new demos
		util.parseDemos(); // run async, parsing takes a while
	}
}

export function fixDuplicateDemoName(demoName: string, mode: ClipMode) {
	const demoPath = util.getBaseDemoPath(mode, true);

	let currentDemoName = demoName;
	let i = 1;
	while (fs.existsSync(path.join(demoPath, `${currentDemoName}.dem`))) {
		currentDemoName = demoName + '_' + i++;
	}

	return currentDemoName;
}

export async function initialise() {
	// create directories
	await fs.ensureDir(util.getBaseDemoPath('clipper', true));
	await fs.ensureDir(util.getBaseDemoPath('archiver', true));

	// initialise the selected mode
	switch (config.main.clip_mode) {
		case 'clipper':
			clipper.initialise();
			break;
		case 'archiver':
			archiver.initialise();
			break;
	}

	// handle manually stopping recording / game automatic stopping at end of round
	netcon.on('console', (message: string) => {
		const demoStoppedRegex =
			/^Completed demo, recording time (.*?), game frames (.*?)\.$/;

		const match = message.match(demoStoppedRegex);
		if (match) {
			onRecordingStop();
		}
	});
}
