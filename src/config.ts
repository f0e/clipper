import fs from 'fs-extra';
import os from 'os';
import ini from 'ini';
import path from 'path';

const CONFIG_PATH = path.join(os.homedir(), '.clipper/config.ini');
const DEFAULT_CSGO_PATH =
	'C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive';

const config = {
	paths: {
		csgo: fs.existsSync(DEFAULT_CSGO_PATH) ? DEFAULT_CSGO_PATH : '',
		clips: 'clips',
	},

	ports: {
		gamestate: 47474,
		netcon: 2121,
	},
};

export async function parseConfig() {
	// load config values
	await fs.ensureFile(CONFIG_PATH);

	const parsedConfig = ini.parse((await fs.readFile(CONFIG_PATH)).toString());
	Object.assign(config, parsedConfig);

	// save new config
	fs.writeFile(
		CONFIG_PATH,
		ini.encode(config, {
			whitespace: true,
		})
	);
}

export default config;
