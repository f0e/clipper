import fs from 'fs-extra';
import path from 'path';
import colors from 'colors';
import { detachGame, initialiseGame } from './game';
import IConfig from '../../types/config.types';
import * as helpers from './util/helpers';

const CONFIG_PATH = path.join(
	process.env.APPDATA ||
		(process.platform == 'darwin'
			? process.env.HOME + '/Library/Preferences'
			: process.env.HOME + '/.local/share'),
	'clipper/config.json'
);

const config: IConfig = {
	main: {
		clip_mode: 'clipper',
	},

	clipper: {
		clip_at_round_end: true,
	},

	paths: {
		csgo: process.env.DOCKER
			? '/csgo-folder'
			: 'C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive',
		base: 'clipper',
		clipper: 'clips',
		archiver: 'archives',
		demo_info: 'demo-info',
	},

	ports: {
		gamestate: 47474,
		netcon: 2121,
	},
};

export let configValid: boolean = undefined;

function getModifiedKeys(base: any, modified: any) {
	const modifiedKeys: string[][] = [];
	helpers.detectChanges(
		base,
		modified,
		(oldValue: any, newValue: any, modifiedKey: string[]) => {
			if (newValue == undefined) modifiedKeys.push(modifiedKey);
		}
	);
	return modifiedKeys.length > 0 ? modifiedKeys : null;
}

export async function loadConfig() {
	await fs.ensureFile(CONFIG_PATH);

	// load config
	try {
		const newConfig = await fs.readJSON(CONFIG_PATH);

		// detect changes in config
		const modifiedKeys = getModifiedKeys(config, newConfig);
		if (modifiedKeys) {
			const s = modifiedKeys.length == 1 ? '' : 's';
			console.log(
				`Config variable${s} ${modifiedKeys
					.map((key) => `'${key.join('.')}'`)
					.join(', ')} missing. Using default value${s}.`
			);
		}

		// load.
		helpers.copyWithoutExtras(newConfig, config);
	} catch (e) {
		console.log('Failed to load config, saving default');
	}

	// save config (removes bad variables and adds defaults)
	await saveConfig();
}

export async function saveConfig() {
	await fs.ensureFile(CONFIG_PATH);
	await fs.writeJSON(CONFIG_PATH, config, {
		spaces: '\t',
	});

	// verify config
	let valid = false;

	try {
		if (!config.ports.gamestate) throw new Error('Gamestate port not defined');
		if (!config.ports.netcon) throw new Error('Netcon port not defined');

		verifyCsgoPath(config.paths.csgo);

		valid = true;
	} catch (e) {
		console.log(`${colors.red('[Config error]')} ${e.message}`);
		valid = false;
	}

	console.log('Updated and saved config');

	// initialise/detach based on validity
	if (configValid != valid) {
		if (valid) {
			initialiseGame();
		} else {
			console.log(
				`${colors.red(
					`Clipper ${
						configValid ? 'stopped' : 'not initialised'
					}, waiting for config changes.`
				)}`
			);
			detachGame();
		}

		configValid = valid;
	}
}

export function verifyCsgoPath(csgoPath: string) {
	if (!fs.existsSync(csgoPath)) throw new Error('CSGO folder does not exist');

	if (!fs.existsSync(path.join(csgoPath, './csgo.exe')))
		throw new Error('csgo.exe not found in CSGO folder');

	if (!fs.existsSync(path.join(csgoPath, '/csgo')))
		throw new Error('/csgo folder not found');

	return true;
}

export default config;
