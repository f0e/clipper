const baseCommand = 'clipper';

class ClipperCommand {
	command: string;
	description: string;
	response: string;

	constructor(command: string, description: string, response: string) {
		this.command = `${baseCommand}-${command}`;
		this.description = description;
		this.response = response;
	}

	buildAlias = () => {
		return `alias ${this.command} "echo ${this.response}"`;
	};
}

class ClipperConsole {
	commands: ClipperCommand[] = [
		new ClipperCommand('example', 'An example command', 'hi'),
	];

	#helpCommand = () => {
		const helpStart = `Clipper commands`;
		const helpCommands = this.commands.map(
			(command) => `${command.command}: ${command.description}`
		);

		return [helpStart, ...helpCommands.map((helpCommand) => `- ${helpCommand}`)]
			.map((command) => `echo ${command}`)
			.join(';');
	};

	registerCommands = async (sendCommand: (command: string) => void) => {
		await sendCommand(`alias ${baseCommand} "${this.#helpCommand()}"`);

		for (const command of this.commands) {
			await sendCommand(command.buildAlias());
		}
	};
}

export default ClipperConsole;
