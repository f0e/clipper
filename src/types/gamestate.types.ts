export interface GameStateProvider {
	name: string;
	appid: number;
	version: number;
	steamid: string;
	timestamp: number;
}

export interface GameStateTeam {
	score: number;
	name: string;
	consecutive_round_losses: number;
	timeouts_remaining: number;
	mathces_won_this_series: number;
}

export interface GameStateMap {
	mode: string;
	name: string;
	phase: 'warmup' | 'intermission' | 'gameover' | 'live';
	round: number;
	team_ct: GameStateTeam;
	team_t: GameStateTeam;
	num_matches_to_win_series: number;
	current_spectators: number;
	souvenirs_total: number;
}

export interface GameStateRound {
	phase: 'freezetime' | 'over' | 'live';
}

export interface GameStatePlayerState {
	health: number;
	armor: number;
	helmet: boolean;
	defusekit: boolean;
	flashed: number;
	smoked: number;
	burning: number;
	money: number;
	round_kills: number;
	round_killhs: number;
	equip_value: number;
}

export interface GameStatePlayerMatchStats {
	kills: number;
	assists: number;
	deaths: number;
	mvps: number;
	score: number;
}

export interface GameStatePlayerWeapons {
	weapon_0: any;
	weapon_1: any;
	weapon_2: any;
	weapon_3: any;
}

export interface GameStateLocalPlayer {
	steamid: string;
	clan: string;
	name: string;
	observer_slot: number;
	team: 'T' | 'CT';
	activity: 'playing' | 'free' | 'textinput' | 'menu';
	state: GameStatePlayerState;
	matchStats: GameStatePlayerMatchStats;
	weapons: GameStatePlayerWeapons;
}

export interface GameStatePlayer {}

export interface GameStateAuth {
	token: string;
}

export interface GameState {
	provider: GameStateProvider;
	map: GameStateMap;
	round: GameStateRound;
	player: GameStateLocalPlayer;
	all_players: GameStatePlayer;
	auth: GameStateAuth;
}
