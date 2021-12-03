import netcon from './netcon';
import * as clipper from './clipper';

const helpCommand = 'clipper';

class ClipperCommand {
	command: string;
	description: string;
	execute?: () => void;

	constructor(command: string, description: string, execute?: () => void) {
		this.command = `${command}`;
		this.description = description;
		this.execute = execute;
	}

	buildAlias = () => {
		let alias = `alias ${this.command} "`;

		let echos = [this.command];

		alias += `"${echos.map((echo) => `echo ${echo}`).join(';')}"`;

		return alias;
	};
}

export class ClipperConsole {
	commands: ClipperCommand[] = [
		new ClipperCommand('clip', 'Clips the current round', () => {
			clipper.clip('new-clip');
		}),
	];

	connect = () => {
		if (!netcon.connected())
			throw new Error('ClipperConsole: Netcon not connected');

		netcon.sendCommand(`alias ${helpCommand} "${this.#helpCommand()}"`);

		for (const command of this.commands) {
			netcon.sendCommand(command.buildAlias());
		}

		netcon.on('console', (message) => {
			const command = this.commands.find(
				(command) => command.command == message
			);

			if (command) command.execute();
		});
	};

	#helpCommand = () => {
		const helpStart = `Clipper commands`;
		const helpCommands = this.commands.map(
			(command) => `${command.command}: ${command.description}`
		);

		return [helpStart, ...helpCommands.map((helpCommand) => `- ${helpCommand}`)]
			.map((command) => `echo ${command}`)
			.join(';');
	};
}

const clipperConsole = new ClipperConsole();

export default clipperConsole;
