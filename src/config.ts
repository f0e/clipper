import fs from 'fs-extra';
import os from 'os';
import ini from 'ini';
import path from 'path';

const DEFAULT_CONFIG_PATH = path.join(__dirname, '../default-config.ini');
const CONFIG_PATH = path.join(os.homedir(), '.clipper/config.ini');

interface IConfig {
	main: {
		clip_mode: 'clipper' | 'archiver';
	};

	clipper: {
		clip_at_round_end: boolean;
	};

	paths: {
		csgo: string;
		demos: string;
		clips: string;
		archives: string;
	};

	ports: {
		gamestate: number;
		netcon: number;
	};
}

const config = {} as IConfig;

function getModifiedKeys(
	base: any,
	modified: any,
	modifiedList: string[] = [],
	keyHistory: string[] = []
) {
	for (const key of Object.keys(base)) {
		const newKeyHistory = keyHistory.concat(key);

		if (!(key in modified) || typeof base[key] != typeof modified[key]) {
			modifiedList.push(newKeyHistory.join('.'));
		} else if (typeof base[key] == 'object') {
			getModifiedKeys(base[key], modified[key], modifiedList, newKeyHistory);
		}
	}

	return modifiedList.length > 0 ? modifiedList : null;
}

export async function parseConfig() {
	// load config values
	await fs.ensureFile(CONFIG_PATH);

	const defaultConfig = ini.parse(
		(await fs.readFile(DEFAULT_CONFIG_PATH)).toString()
	);

	const newConfigContents = (await fs.readFile(CONFIG_PATH)).toString();
	if (newConfigContents) {
		Object.assign(config, ini.parse(newConfigContents));
	} else {
		// config is empty, copy default config
		await fs.copy(DEFAULT_CONFIG_PATH, CONFIG_PATH);
	}

	const modifiedKeys = getModifiedKeys(defaultConfig, config);
	if (modifiedKeys) {
		throw new Error(
			`Config variables missing: ${modifiedKeys
				.map((key) => `'${key}'`)
				.join(', ')}. Please re-copy default-config.ini or add the missing keys`
		);
	}
}

export default config;
