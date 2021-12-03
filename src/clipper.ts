import fs from 'fs-extra';
import path from 'path';
import gamestate from './gamestate';
import netcon from './netcon';
import {
	ERecordingError,
	EStopRecordingError,
	IRecordingError,
} from './types/clipper.types';

const tempDemoName = 'clipper-temp';

let recordingState = {
	recording: false,
};

let clippingState = {
	clipping: false,
	clipName: '',
};

let stoppingRecording = false;

export function clip(clipName: string) {
	if (!recordingState.recording)
		return netcon.echo('Cannot clip, not recording.');

	if (clippingState.clipping) {
		clippingState.clipName = clipName;

		netcon.echo('Already clipping, changed clip name');
	} else {
		clippingState.clipping = true;
		clippingState.clipName = clipName;

		netcon.echo(`Clipping to ${clippingState.clipName}`);
	}
}

export async function onFreezetime() {
	// new freezetime, start recording demo
	try {
		if (recordingState.recording) {
			try {
				await stopRecordingDemo();

				netcon.echo('Stopped recording demo');
				recordingState.recording = false;
			} catch (e) {
				if (e instanceof IRecordingError) {
					switch (e.code) {
						case EStopRecordingError.NOT_RECORDING:
							recordingState.recording = false;
							break;

						case EStopRecordingError.STOP_AT_END_ROUND:
							netcon.echo(
								'Recording cannot stop yet, recording this round as well'
							);
							break;
					}
				}
			}
		}

		if (!recordingState.recording) {
			if (clippingState.clipping) {
				console.log(`Saving clip ${clippingState.clipName}`);

				const csgoPath = path.join(process.env.CSGO_FOLDER, 'csgo');
				const clipPath = path.join(csgoPath, process.env.CLIP_FOLDER);

				fs.ensureDir(clipPath);

				await fs.rename(
					path.join(csgoPath, `${tempDemoName}.dem`),
					path.join(clipPath, `${clippingState.clipName}.dem`)
				);

				netcon.echo(`Clip ${clippingState.clipName} saved!`);

				clippingState.clipping = false;
			}

			await recordDemo(`clipper-temp`);
			netcon.echo('Recording demo...');

			// update recording state
			recordingState.recording = true;
		}
	} catch (e) {
		if (e instanceof IRecordingError) {
			switch (e.code) {
				case ERecordingError.ALREADY_RECORDING: {
					netcon.echo(
						'You are already recording a demo, please stop recording manually to enable clipper.'
					);

					break;
				}
				case ERecordingError.WAIT_FOR_ROUND_OVER: {
					// todo: this
					break;
				}
				case ERecordingError.RECORDING_DIFFERENT_DEMO: {
					// todo: this
					break;
				}
			}
		} else throw e;
	}
}

async function recordDemo(demoName: string) {
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
				return commandFail(ERecordingError.ALREADY_RECORDING);

			if (message == waitForRoundOver)
				return commandFail(ERecordingError.WAIT_FOR_ROUND_OVER);

			// check for recording
			const match = message.match(successRegex);
			if (match) {
				const recordingDemoName = match[1];
				if (recordingDemoName != demoName)
					return commandFail(ERecordingError.RECORDING_DIFFERENT_DEMO);

				commandSuccess();
			}
		};

		await netcon.sendCommand(`record ${demoName}`, waitForRecord);

		if (success) return resolve();
		else if (fail) return reject(new IRecordingError(failReason));
		else return reject('unknown error');
	});
}

async function stopRecordingDemo() {
	return new Promise<void>(async (resolve, reject) => {
		// todo: better solution than this
		let success = false,
			fail = false,
			failReason: EStopRecordingError;

		const commandFail = (error: EStopRecordingError) => {
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
				return commandFail(EStopRecordingError.STOP_AT_END_ROUND);

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
		else return reject(new IRecordingError(EStopRecordingError.NOT_RECORDING));
	});
}

export function onRecordingStop() {
	if (stoppingRecording) return; // already handling.

	if (recordingState.recording) {
		recordingState.recording = false;
		netcon.echo('Stopped recording demo');
	}
}

export function initialise() {
	gamestate.on('round.phase', ({ value }) => {
		if (value == 'freezetime') onFreezetime();
	});

	netcon.on('console', (message: string) => {
		const demoStoppedRegex =
			/^Completed demo, recording time (.*?), game frames (.*?)\.$/;

		const match = message.match(demoStoppedRegex);
		if (match) {
			onRecordingStop();
		}
	});
}
