import netcon from './connections/netcon';
import clipperConsole from './console';
import gamestate from './connections/gamestate';
import config from './config';
import * as recording from './clips/recording';

export async function initialiseGame() {
	// set up gamestate
	await gamestate.initialise(config.ports.gamestate);

	// set up netcon & console
	await netcon.connect(config.ports.netcon);
	await clipperConsole.connect();

	// set up clipper
	recording.initialise();

	console.log(`Initialised ${config.main.clip_mode}`);
}

export async function detachGame() {
	Promise.all([gamestate.stop(), netcon.stop()]);
}
