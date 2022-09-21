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

		const host = process.env.DOCKER ? 'host.docker.internal' : '127.0.0.1';

		await waitOn({
			resources: [`tcp:${host}:${port}`],
		});

		await this.#connection.connect({
			host,
			port,
			negotiationMandatory: false,
			timeout: 1500,
		});

		this.#connection.getSocket().on('data', (data) => {
			const message = data.toString('utf8').trim();
			this.onCommand(message);
		});

		this.#connection.on('close', () => {
			// csgo closed.. wait to reconnect:)
			this.connect(port);
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

	sendCommand = async (command: string) => {
		let response = '';

		const listener = (message: string) => (response = message);

		this.on('console', listener);

		try {
			await this.#connection.exec(command);
		} catch (e) {}

		this.removeListener('console', listener);

		return response;
	};

	getVar = async (varName: string) => {
		return new Promise<any>(async (resolve, reject) => {
			let value = null;

			const res = await this.sendCommand(varName);
			if (res.includes(`"${varName}" =`))
				value = res.split(' = "')[1].split('"')[0]; // poo todo: use regex ? :)

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
