import netcon from './connections/netcon';
import clipperConsole from './console';
import gamestate from './connections/gamestate';
import config from './config';
import recording from './clips/recording';

export async function initialiseGame() {
	// set up gamestate
	await gamestate.initialise(config.ports.gamestate);

	// set up netcon & console
	await netcon.connect(config.ports.netcon);
	await clipperConsole.connect();

	// set up clipper
	recording.initialise();

	netcon.echo(`Clipper started, mode: ${config.main.clip_mode}`);
}

export async function detachGame() {
	console.log('detached');
	Promise.all([gamestate.stop(), netcon.stop()]);
}

export async function reinitialiseGame() {
	// clear existing event listeners
	await Promise.all([gamestate.clear(), netcon.clear()]);

	// set up clipper
	recording.initialise();

	netcon.echo(`Clipper changed mode to ${config.main.clip_mode}`);
}
