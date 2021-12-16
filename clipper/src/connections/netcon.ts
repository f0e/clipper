import EventEmitter from 'events';
import Telnet from 'telnet-client';
import waitOn from 'wait-on';
import colors from 'colors';

export class Netcon extends EventEmitter {
	#connection = new Telnet();
	#connected = false;

	connect = async (port: number) => {
		await this.stop();

		console.log('Waiting for CSGO');

		try {
			await waitOn({
				resources: [`tcp:${port}`],
				interval: 100,
				timeout: 90000,
				window: 500,
			});
		} catch (e) {
			throw new Error('Failed to connect to CSGO');
		}

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

		this.#connected = true;

		console.log('Connected to CSGO');
	};

	stop = async () => {
		await this.removeAllListeners();

		if (this.#connected) {
			await this.#connection.end();
			this.#connected = false;
			console.log('Closed CSGO connection');
		}
	};

	connected = () => this.#connected;

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

	playDemo = async (demoPath: string) => {
		await this.sendCommand(`playdemo "${demoPath}"`);
	};

	recordDemo = async (demoName: string) => {
		await this.sendCommand(`record "${demoName}"`);
	};

	stopRecordingDemo = async () => {
		await this.sendCommand(`stop`);
	};
}

const netcon = new Netcon();
export default netcon;
