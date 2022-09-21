import fs from 'fs-extra';
import path from 'path';
import Demo from '../../../types/demo.types';
import config from '../config';
import { ClipMode } from '../../../types/config.types';
import * as demo from './demo';

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
		const { name: demoName } = path.parse(demoFilename);
		const demoPath = path.join(getDemoPath(mode, demoFilename));

		const { birthtime: creationDate } = await fs.stat(demoPath);
		const demoInfo = await getDemoInfo(mode, demoFilename);

		demos.push({
			name: demoName,
			filename: demoFilename,
			path: demoPath,
			mode: mode,
			created: creationDate,

			parsed: demoInfo != null,
			info: demoInfo,
		});
	}

	// sort demos by recency (todo: fix in docker)
	demos.sort((a, b) => b.created.getTime() - a.created.getTime());

	return demos;
}

export async function parseDemo(
	mode: ClipMode,
	demoName: string,
	skipIfDone: boolean
) {
	const demoPath = getDemoPath(mode, demoName);
	const demoInfoPath = getDemoInfoPath(mode, demoName);

	if (skipIfDone) {
		if (fs.existsSync(demoInfoPath)) return;
	}

	const demoInfo = await demo.parseDemo(demoPath);
	await fs.writeJSON(demoInfoPath, demoInfo);

	console.log(`Parsed demo ${demoName} (${mode})`);
}

export async function parseDemos() {
	const update = async (mode: ClipMode) => {
		const demoInfosPath = getBaseDemoInfoPath(mode);
		await fs.ensureDir(demoInfosPath);

		const demos = await getDemoFilenames(mode);

		for (const demoFilename of demos) {
			await parseDemo(mode, demoFilename, true);
		}
	};

	await update('clipper');
	await update('archiver');
}
