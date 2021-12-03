import 'dotenv/config';

import express from 'express';
import ClipperConsole from './clipper-console';
import GameState from './gamestate';
import Netcon from './netcon';

// set up web server
const app = express();
const port = process.env.GAMESTATE_PORT || 47474;

app.use(express.json());

// start the server
app
	.listen(port, () => {
		console.log(`App started on port ${port}`);
	})
	.on('error', (e) => {
		console.log(`Fatal error: ${e.message}`);
	});

async function main() {
	// set up gamestate
	const gamestate = new GameState(app);

	gamestate.addListener('change', (args) => {
		if (args.oldValue == null) return;
		if (args.variable == 'provider.timestamp') return;
		console.log(
			`variable ${args.oldValue == null ? 'initialised' : 'changed'}`,
			args
		);
	});

	gamestate.addListener('round.phase', ({ oldValue, value }) => {
		if (value == 'freezetime') {
			console.log('now in freezetime');
		}
	});

	// set up netcon
	const netcon = new Netcon();
	await netcon.connect(parseInt(process.env.NETCON_PORT) || 2121);

	netcon.on('console', (msg) => console.log('[Console]', msg));

	// set up commands
	const clipperConsole = new ClipperConsole();
	await clipperConsole.registerCommands(netcon.sendCommand);
}

main();
