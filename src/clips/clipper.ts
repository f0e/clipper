import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import * as clips from './clips';
import {
	ERecordingError,
	EStopRecordingError,
	IRecordingError,
} from '../types/clipper.types';

const tempDemoName = 'clipper-temp';

let clippingState = {
	clipping: false,
	clipName: '',
};

export function clip(clipName: string) {
	if (!clips.isRecording()) return netcon.echo('Cannot clip, not recording.');

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
		if (clips.isRecording()) {
			try {
				await clips.stopRecordingDemo();
				clips.onRecordingStop();

				saveClip();
			} catch (e) {
				if (e instanceof IRecordingError) {
					switch (e.code) {
						case EStopRecordingError.NOT_RECORDING: {
							clips.forceStopRecording();
							break;
						}
						case EStopRecordingError.STOP_AT_END_ROUND: {
							netcon.echo(
								'Recording cannot stop yet, recording this round as well'
							);
							break;
						}
					}
				}
			}
		}

		if (!clips.isRecording()) {
			// build demo name
			const dateString = new Date().toISOString().slice(0, 10);

			let demoName = `${gamestate.state.map.name}_clipper-temp`;
			demoName = clips.fixDuplicateDemoName(demoName, config.paths.clips);

			await clips.recordDemo(demoName);
			clips.onRecordingStart(demoName);

			if (config.clipper.clip_at_round_end) {
				await clips.stopRecordingDemo();
			}
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
			}
		} else throw e;
	}
}

async function saveClip() {
	if (!clippingState.clipping) return;

	console.log(`Saving clip ${clippingState.clipName}`);

	const csgoPath = path.join(config.paths.csgo, 'csgo');
	const clipPath = path.join(csgoPath, config.paths.demos, config.paths.clips);

	await fs.rename(
		path.join(csgoPath, `${tempDemoName}.dem`),
		path.join(clipPath, `${clippingState.clipName}.dem`)
	);

	netcon.echo(`Clip ${clippingState.clipName} saved!`);

	clippingState.clipping = false;
}

export function initialise() {
	gamestate.on('round.phase', ({ value }) => {
		if (value == 'freezetime') onFreezetime();
	});
}
