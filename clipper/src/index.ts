import express from 'express';
import fs from 'fs-extra';

import netcon from './connections/netcon';
import clipperConsole from './console';
import gamestate from './connections/gamestate';
import config, { loadConfig } from './config';
import startServer from './server/server';
import * as recording from './clips/recording';
import * as util from './util/util';

export default async function run() {
	// load config
	await loadConfig();

	// verify config
	if (!config.ports.gamestate) throw new Error('Gamestate port not defined');
	if (!config.ports.netcon) throw new Error('Netcon port not defined');

	if (!fs.existsSync(util.getCsgoPath()))
		throw new Error('CSGO folder does not exist');

	// set up web server
	startServer(config.ports.server);

	// set up gamestate
	gamestate.initialise(config.ports.gamestate);

	// set up netcon & console
	await netcon.connect(config.ports.netcon);
	await clipperConsole.connect();

	// set up clipper
	recording.initialise();

	console.log(`Initialised ${config.main.clip_mode}`);
}

run();
