import fs from 'fs-extra';
import { DemoFile } from 'demofile';
import { DemoInfo } from '../../../types/demo.types';

export async function parseDemo(demoPath: string) {
	return new Promise<DemoInfo>(async (resolve, reject) => {
		const demo = new DemoInfo();
		const demoFile = new DemoFile();

		demoFile.on('start', ({ cancel }) => {
			demo.headers = {
				serverName: demoFile.header.serverName,
				localPlayer: demoFile.header.clientName,
				map: demoFile.header.mapName,
				time: demoFile.header.playbackTime,
				ticks: demoFile.header.playbackTicks,
			};
		});

		// // parse demo events
		// demoFile.gameEvents.on('player_death', (e) => {
		// 	demo.kills.push(e);
		// });

		demoFile.on('end', (e) => {
			if (e.error) return reject(e);
			else return resolve(demo);
		});

		demoFile.parse(await fs.readFile(demoPath));
	});
}
