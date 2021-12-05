import fs from 'fs-extra';
import ini from 'ini';
import path from 'path';

const CONFIG_PATH = path.join(
	process.env.APPDATA ||
		(process.platform == 'darwin'
			? process.env.HOME + '/Library/Preferences'
			: process.env.HOME + '/.local/share'),
	'clipper/config.json'
);

export type ClipMode = 'clipper' | 'archiver';

interface IConfig {
	main: {
		clip_mode: ClipMode;
	};

	clipper: {
		clip_at_round_end: boolean;
	};

	paths: {
		csgo: string;
		base: string;
		clipper: string;
		archiver: string;
		demo_info: string;
	};

	ports: {
		gamestate: number;
		netcon: number;
	};
}

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
	},
};

export async function loadConfig() {
	await fs.ensureFile(CONFIG_PATH);

	try {
		const newConfig = await fs.readJSON(CONFIG_PATH);
		Object.assign(config, newConfig);
	} catch (e) {
		console.log('Failed to load config');
	}

	console.log(config);
}

export async function saveConfig() {
	await fs.ensureFile(CONFIG_PATH);
	await fs.writeJSON(CONFIG_PATH, config);

	console.log('Saved config');
}

export default config;
