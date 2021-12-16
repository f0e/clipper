import express from 'express';
import fs from 'fs-extra';
import colors from 'colors';
import netcon from './connections/netcon';
import clipperConsole from './console';
import gamestate from './connections/gamestate';
import config, { configValid, loadConfig, verifyConfig } from './config';
import startServer from './server/server';
import * as recording from './clips/recording';
import * as util from './util/util';

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

export default async function run() {
	// set up web server
	startServer(config.ports.server);

	// load config
	await loadConfig();

	// verify config
	if (!configValid) {
		console.log(
			'Clipper not initialised, waiting for config changes. Use the manager to fix any config errors.'
		);
	}
}

run();
