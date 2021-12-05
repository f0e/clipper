import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import * as recording from './recording';
import * as util from '../util/util';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';

const tempDemoName = 'clipper-temp';

let clippingState = {
	clipping: false,
	clipName: '',
};

export function clip(clipName: string) {
	if (!recording.isRecording())
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
	try {
		if (recording.isRecording()) {
			try {
				await recording.stopRecordingDemo();
				recording.onRecordingStop();
			} catch (e) {
				if (e instanceof IRecordingError) {
					switch (e.code) {
						case ERecordingError.STOP_NOT_RECORDING: {
							recording.forceStopRecording();
							break;
						}
						case ERecordingError.STOP_STOPPING_AT_END_ROUND: {
							netcon.echo(
								'Recording cannot stop yet, recording this round as well'
							);
							break;
						}
					}
				}
			}
		}

		if (!recording.isRecording()) {
			const demoName = 'clipper-temp';

			await recording.recordDemo(demoName);
			recording.onRecordingStart(demoName);

			if (config.clipper.clip_at_round_end) {
				await recording.stopRecordingDemo();
			}
		}
	} catch (e) {
		if (e instanceof IRecordingError) {
			switch (e.code) {
				case ERecordingError.RECORD_ALREADY_RECORDING: {
					console.log('Hmmmm....', e);
					netcon.echo(
						'You are already recording a demo, please stop recording manually to enable clipper.'
					);

					break;
				}
			}
		} else throw e;
	}
}

export async function saveClip() {
	if (!clippingState.clipping) return;

	console.log(`Saving clip ${clippingState.clipName}`);

	await fs.rename(
		path.join(util.getCsgoPath(), `${tempDemoName}.dem`),
		path.join(
			util.getBaseDemoPath('clipper', true),
			`${clippingState.clipName}.dem`
		)
	);

	netcon.echo(`Clip ${clippingState.clipName} saved!`);

	clippingState.clipping = false;
}

export function initialise() {
	gamestate.on('round.phase', ({ value }) => {
		if (value == 'freezetime') onFreezetime();
	});
}
