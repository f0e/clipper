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

	parsed: boolean;
	info: DemoInfo;
}
