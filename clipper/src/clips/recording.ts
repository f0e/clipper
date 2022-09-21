import fs from 'fs-extra';
import path from 'path';
import EventEmitter from 'events';
import config from '../config';
import netcon from '../connections/netcon';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';
import { ClipMode } from '../../../types/config.types';

import * as clipper from './clipper';
import * as archiver from './archiver';
import * as util from '../util/util';

export class Recording extends EventEmitter {
	#recording = false;
	#stoppingRecording = false;

	initialise = async () => {
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
				this.onRecordingStop();
			}
		});
	};

	isRecording = () => this.#recording;
	forceStopRecording = () => (this.#recording = false);

	recordDemo = async (demoName: string) => {
		return new Promise<void>(async (resolve, reject) => {
			const res = await netcon.sendCommand(`record ${demoName}`);

			const alreadyRecording = 'Already recording.';
			const waitForRoundOver =
				'Please start demo recording after current round is over.';
			const successRegex = /^Recording to (.*?)\.dem\.\.\.$/;

			// check for failed recording
			if (res == alreadyRecording)
				return reject(
					new IRecordingError(ERecordingError.RECORD_ALREADY_RECORDING)
				);

			if (res == waitForRoundOver)
				return reject(
					new IRecordingError(ERecordingError.RECORD_WAIT_FOR_ROUND_OVER)
				);

			// check for recording
			const match = res.match(successRegex);
			if (match) {
				const recordingDemoName = match[1];
				if (recordingDemoName != demoName)
					return reject(
						new IRecordingError(ERecordingError.RECORD_RECORDING_DIFFERENT_DEMO)
					);

				return resolve();
			}

			// ??
			return reject('unknown error');
		});
	};

	stopRecordingDemo = async () => {
		return new Promise<void>(async (resolve, reject) => {
			this.#stoppingRecording = true;
			const res = await netcon.sendCommand('stop');
			this.#stoppingRecording = false;

			if (res == '')
				return reject(new IRecordingError(ERecordingError.STOP_NOT_RECORDING));

			const successRegex =
				/^Completed demo, recording time (.*?), game frames (.*?)\.$/;
			const stopAtRoundEnd =
				'Demo recording will stop as soon as the round is over.';
			const recordInDemo = "Can't record during demo playback.";

			// check for failed stop
			if (res == stopAtRoundEnd)
				return reject(
					new IRecordingError(ERecordingError.STOP_STOPPING_AT_END_ROUND)
				);

			if (res == recordInDemo)
				return reject(new IRecordingError(ERecordingError.RECORD_IN_DEMO));

			// check for stop
			const match = res.match(successRegex);
			if (match) return resolve();

			// ??
			return reject('unknown error');
		});
	};

	onRecordingStart = (demoName: string) => {
		if (!this.#recording) {
			// update recording state
			netcon.echo(`Recording demo '${demoName}'...`);
			this.#recording = true;
		}
	};

	onRecordingStop = async () => {
		if (this.#stoppingRecording) return; // already handling.

		if (this.#recording) {
			this.#recording = false;
			netcon.echo('Stopped recording demo');

			// mode-specific functions
			if (config.main.clip_mode == 'clipper') {
				await clipper.saveClip();
			}

			// parse new demos
			util.parseDemos(); // run async, parsing takes a while
		}
	};

	fixDuplicateDemoName = (demoName: string, mode: ClipMode) => {
		const demoPath = util.getBaseDemoPath(mode, true);

		let currentDemoName = demoName;
		let i = 1;
		while (fs.existsSync(path.join(demoPath, `${currentDemoName}.dem`))) {
			currentDemoName = demoName + '_' + i++;
		}

		return currentDemoName;
	};
}

const recording = new Recording();
export default recording;
