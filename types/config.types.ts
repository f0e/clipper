export type ClipMode = 'clipper' | 'archiver';

export default interface IConfig {
	main: {
		clip_mode: ClipMode;
	};

	clipper: {
		clip_at_round_end: boolean;
	};

	paths: {
		csgo: string;
		base: string;
		clipper: string;
		archiver: string;
		demo_info: string;
	};

	ports: {
		gamestate: number;
		netcon: number;
	};
}
