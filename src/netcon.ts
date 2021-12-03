import EventEmitter from 'events';
import Telnet from 'telnet-client';

class Netcon extends EventEmitter {
	#connection = new Telnet();

	connect = async (port: number) => {
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
	};

	onCommand = (message: string) => {
		this.emit('console', message);
	};

	sendCommand = async (command: string) => {
		try {
			return await this.#connection.exec(command);
		} catch (e) {}
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

export default Netcon;
