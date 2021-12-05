import fs from 'fs-extra';
import path from 'path';
import Demo from '../../../types/demo.types';
import config, { ClipMode } from '../config';

// ---- main
export function getCsgoPath() {
	return path.join(config.paths.csgo, 'csgo');
}

export function getBasePath() {
	return path.join(getCsgoPath(), config.paths.base);
}

// ---- demos
export function getBaseDemoPath(mode: ClipMode, full: boolean = false) {
	if (full)
		return path.join(getCsgoPath(), config.paths.base, config.paths[mode]);
	else return path.join(config.paths.base, config.paths[mode]);
}

export function getDemoPath(mode: ClipMode, demoFilename: string) {
	return path.join(getBaseDemoPath(mode, true), demoFilename);
}

export async function getDemoFilenames(mode: ClipMode) {
	return await fs.readdir(getBaseDemoPath(mode, true));
}

// ---- demo info
export function getBaseDemoInfoPath(mode: ClipMode) {
	return path.join(getBasePath(), config.paths.demo_info, config.paths[mode]);
}

export function getDemoInfoPath(mode: ClipMode, demoFilename: string) {
	const demoName = path.parse(demoFilename).name;

	const demoInfoPath = path.join(
		getBaseDemoInfoPath(mode),
		`${demoName}.info.json`
	);

	return demoInfoPath;
}

export async function getDemoInfo(mode: ClipMode, demoFilename: string) {
	const demoInfoPath = getDemoInfoPath(mode, demoFilename);

	if (!fs.existsSync(demoInfoPath)) return null;
	else return await fs.readJSON(demoInfoPath);
}

// ---- combined
export async function getDemos(mode: ClipMode) {
	// get filenames
	const filenames = await getDemoFilenames(mode);

	// get demo infos
	const demos: Demo[] = [];
	for (const demoFilename of filenames) {
		const demoInfo = await getDemoInfo(mode, demoFilename);

		demos.push({
			name: path.parse(demoFilename).name,
			parsed: demoInfo != null,
			info: demoInfo,
		});
	}

	return demos;
}
