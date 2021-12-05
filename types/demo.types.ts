import { ClipMode } from './config.types';

export interface IDemoHeaders {
	localPlayer: string;
	serverName: string;
	map: string;
	ticks: number;
	time: number;
}

export class DemoInfo {
	headers: IDemoHeaders;
	// kills: IEventPlayerDeath[] = [];
}

export default class Demo {
	name: string;
	filename: string;
	path: string;
	mode: ClipMode;

	parsed: boolean;
	info: DemoInfo;
}
