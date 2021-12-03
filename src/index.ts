import express from 'express';
import fs from 'fs-extra';
import path from 'path';

import netcon from './netcon';
import clipperConsole from './clipper-console';
import gamestate from './gamestate';
import config, { parseConfig } from './config';

import * as clipper from './clipper';

async function main() {
	// load config
	await parseConfig();

	console.log(config);

	// verify environment variables
	if (!config.ports.gamestate) throw new Error('Gamestate port not defined');
	if (!config.ports.netcon) throw new Error('Netcon port not defined');

	const csgoPath = path.join(config.paths.csgo, 'csgo');
	if (!fs.existsSync(csgoPath)) throw new Error('CSGO folder does not exist');

	// set up web server
	const app = express();
	app.use(express.json());

	await app.listen(config.ports.gamestate);

	// set up gamestate
	gamestate.initialise(app);

	// set up netcon & console
	await netcon.connect(config.ports.netcon);
	await clipperConsole.connect();

	// set up clipper
	clipper.initialise();

	console.log('Initialised');
}

main();
