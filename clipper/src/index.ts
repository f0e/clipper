import express from 'express';
import fs from 'fs-extra';
import path from 'path';

import netcon from './connections/netcon';
import clipperConsole from './console';
import gamestate from './connections/gamestate';
import config, { parseConfig } from './config';
import startServer from './server/server';
import * as recording from './clips/recording';
import * as util from './util/util';

export default async function run() {
	// load config
	await parseConfig();

	// verify config
	if (!config.ports.gamestate) throw new Error('Gamestate port not defined');
	if (!config.ports.netcon) throw new Error('Netcon port not defined');

	if (!fs.existsSync(util.getCsgoPath()))
		throw new Error('CSGO folder does not exist');

	// set up gamestate web server
	const gamestateServer = express();
	gamestateServer.use(express.json());

	await gamestateServer.listen(config.ports.gamestate);

	// set up gamestate
	gamestate.initialise(gamestateServer);

	// set up netcon & console
	await netcon.connect(config.ports.netcon);
	await clipperConsole.connect();

	// set up clipper
	recording.initialise();

	console.log(`Initialised ${config.main.clip_mode}`);

	// set up web server
	startServer();
}

run();