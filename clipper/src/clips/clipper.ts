import fs from 'fs-extra';
import path from 'path';
import config from '../config';
import gamestate from '../connections/gamestate';
import netcon from '../connections/netcon';
import recording from './recording';
import * as util from '../util/util';
import { getDateString } from '../util/helpers';
import { ERecordingError, IRecordingError } from '../../../types/clipper.types';

const tempDemoName = 'clipper-temp';

let clippingState = {
	clipping: false,
	clipName: '',
};

export function clip() {
	if (!recording.isRecording())
		return netcon.echo("Can't clip, not recording.");

	if (clippingState.clipping) {
		netcon.echo('Already clipping.');
		return;
	}

	// todo: is there some way to let the user name to their clips in the console when they clip???
	// all i can think of is using echo but thats terrible

	// build demo name
	let demoName = `${getDateString()}_${gamestate.state.map.name}_${
		gamestate.state.map.mode
	}_round${gamestate.state.map.round}`;
	demoName = recording.fixDuplicateDemoName(demoName, 'clipper');

	clippingState.clipping = true;
	clippingState.clipName = demoName;

	netcon.echo(`Clipping to ${clippingState.clipName}`);
}

async function tryStopRecording() {
	if (!recording.isRecording()) return;

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
					netcon.echo("Recording can't stop yet, recording this round as well");
					break;
				}
				case ERecordingError.RECORD_IN_DEMO: {
					netcon.echo("Can't record in demo");
					break;
				}
			}
		}
	}
}

export async function onFreezetime() {
	try {
		await tryStopRecording();

		if (!recording.isRecording()) {
			await recording.recordDemo(tempDemoName);
			recording.onRecordingStart(tempDemoName);
		}
	} catch (e) {
		if (e instanceof IRecordingError) {
			switch (e.code) {
				case ERecordingError.RECORD_ALREADY_RECORDING: {
					netcon.echo(
						'You are already recording a demo, please stop recording manually to enable clipper.'
					);

					break;
				}
			}
		} else {
			console.log('unknown error.');
		}
	}
}

export async function onRoundOver() {
	if (config.clipper.clip_at_round_end) {
		await tryStopRecording();
	}
}

export async function saveClip() {
	if (!clippingState.clipping) return;

	console.log(`Saving clip ${clippingState.clipName}`);

	const fixedClipName = recording.fixDuplicateDemoName(
		clippingState.clipName,
		'clipper'
	);

	await fs.rename(
		path.join(util.getCsgoPath(), `${tempDemoName}.dem`),
		path.join(util.getBaseDemoPath('clipper', true), `${fixedClipName}.dem`)
	);

	netcon.echo(`Clip ${clippingState.clipName} saved!`);

	clippingState.clipping = false;
}

export function initialise() {
	gamestate.on('round.phase', ({ value }) => {
		switch (value) {
			case 'freezetime': {
				onFreezetime();
				break;
			}
			case 'over': {
				onRoundOver();
				break;
			}
		}
	});
}
