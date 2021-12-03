import fs from 'fs-extra';
import path from 'path';
import netcon from './netcon';

enum ERecordingError {
	ALREADY_RECORDING,
	WAIT_FOR_ROUND_OVER,
	RECORDING_DIFFERENT_DEMO,
}

enum EStopRecordingError {
	NOT_RECORDING,
	STOP_AT_END_ROUND,
}

class IRecordingError extends Error {
	code: ERecordingError | EStopRecordingError;

	constructor(code: ERecordingError | EStopRecordingError) {
		super(code.toString());
		this.code = code;
	}
}

const tempDemoName = 'clipper-temp';

let recordingState = {
	recording: false,
};

let clippingState = {
	clipping: false,
	clipName: '',
};

export function clip(clipName: string) {
	if (!recordingState.recording)
		return netcon.echo('Cannot clip, not recording.');

	clippingState.clipping = true;
	clippingState.clipName = clipName;

	netcon.echo(`Clipping to ${clippingState.clipName}`);
}

export async function onFreezetime() {
	// new freezetime, start recording demo
	try {
		if (recordingState.recording) {
			try {
				await stopRecordingDemo();

				netcon.echo(`Stopped recording demo`);
				recordingState.recording = false;
			} catch (e) {
				if (e instanceof IRecordingError) {
					switch (e.code) {
						case EStopRecordingError.NOT_RECORDING:
							recordingState.recording = false;
							break;

						case EStopRecordingError.STOP_AT_END_ROUND:
							console.log(
								"Recording can't stop yet, recording this round as well"
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

		await netcon.sendCommand('stop', waitForRecord);

		if (success) return resolve();
		else if (fail) return reject(new IRecordingError(failReason));
		else return reject(new IRecordingError(EStopRecordingError.NOT_RECORDING));
	});
}
