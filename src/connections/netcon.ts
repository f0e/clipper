import EventEmitter from 'events';
import Telnet from 'telnet-client';
import waitOn from 'wait-on';
import colors from 'colors';

export class Netcon extends EventEmitter {
	#connection = new Telnet();

	connect = async (port: number) => {
		console.log('Waiting for CSGO');

		await waitOn({
			resources: [`tcp:${port}`],
			interval: 100,
			timeout: 90000,
			window: 500,
		});

		await this.#connection.connect({
			host: '127.0.0.1',
			port,
			negotiationMandatory: false,
			timeout: 1500,
		});

		this.#connection.getSocket().on('data', (data) => {
			const message = data.toString('utf8').trim();
			this.onCommand(message);
		});

		console.log('Connected to CSGO');
	};

	connected = () => netcon.connected;

	onCommand = (message: string) => {
		this.emit('console', message);
	};

	echo = (message: string) => {
		console.log(`${colors.grey('[console]')} ${message}`);
		this.sendCommand(`echo [clipper] ${message}`);
	};

	sendCommand = async (
		command: string,
		listener?: (message: string) => void
	) => {
		if (listener) this.on('console', listener);

		try {
			return await this.#connection.exec(command);
		} catch (e) {}

		if (listener) this.removeListener('console', listener);
	};

	getVar = async (varName: string) => {
		return new Promise<any>(async (resolve, reject) => {
			let value = null;

			const listener = (message: string) => {
				if (message.includes(`"${varName}" =`)) {
					value = message.split(' = "')[1].split('"')[0]; // poo todo: use regex ? :)
				}
			};

			await this.sendCommand(varName, listener);

			if (value) resolve(value);
			else reject();
		});
	};

	recordDemo = async (demoName: string) => {
		const res = await this.sendCommand(`record ${demoName}`);
		console.log(res);
	};

	stopRecordingDemo = async () => {
		const res = await this.sendCommand(`stop`);
		console.log(res);
	};
}

const netcon = new Netcon();
export default netcon;
