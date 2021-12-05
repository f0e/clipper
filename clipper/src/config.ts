import fs from 'fs-extra';
import path from 'path';
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
		csgo: 'C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive',
		base: 'clipper',
		clipper: 'clips',
		archiver: 'archives',
		demo_info: 'demo-info',
	},

	ports: {
		gamestate: 47474,
		netcon: 2121,
		server: 3001,
	},
};

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
			const chungus = modifiedKeys.length == 1 ? '' : 's';
			console.log(
				`Config variable${chungus} ${modifiedKeys
					.map((key) => `'${key.join('.')}'`)
					.join(', ')} missing. Using default value${chungus}.`
			);
		}

		// load.
		helpers.copyWithoutExtras(newConfig, config);
	} catch (e) {
		console.log('Failed to load config, saving default');
		saveConfig();
	}

	// save config (removes bad variables and adds defaults)
	saveConfig();
}

export async function saveConfig() {
	await fs.ensureFile(CONFIG_PATH);
	await fs.writeJSON(CONFIG_PATH, config, {
		spaces: '\t',
	});

	console.log('Saved config');
}

export default config;
