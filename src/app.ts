import 'dotenv/config';

import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const gamestatePort = process.env.GAMESTATE_PORT || 47474;
const netconPort = parseInt(process.env.NETCON_PORT) || 2121;

// set up web server
const app = express();
app.use(express.json());

import netcon from './netcon';
import clipperConsole from './clipper-console';
import gamestate from './gamestate';

import * as clipper from './clipper';

async function main() {
	const csgoPath = path.join(process.env.CSGO_FOLDER, 'csgo');
	if (!fs.existsSync(csgoPath)) throw new Error('CSGO folder does not exist');

	// start the web server
	await app.listen(gamestatePort);

	// set up gamestate
	gamestate.initialise(app);

	// set up netcon & console
	await netcon.connect(netconPort);
	await clipperConsole.connect();

	// set up clipper
	clipper.initialise();

	console.log('Initialised');
}

main();
