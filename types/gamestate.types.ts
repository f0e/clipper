export interface IGameStateProvider {
	name: string;
	appid: number;
	version: number;
	steamid: string;
	timestamp: number;
}

export interface IGameStateTeam {
	score: number;
	name: string;
	consecutive_round_losses: number;
	timeouts_remaining: number;
	mathces_won_this_series: number;
}

export interface IGameStateMap {
	mode: string;
	name: string;
	phase: 'warmup' | 'intermission' | 'gameover' | 'live';
	round: number;
	team_ct: IGameStateTeam;
	team_t: IGameStateTeam;
	num_matches_to_win_series: number;
	current_spectators: number;
	souvenirs_total: number;
}

export interface IGameStateRound {
	phase: 'freezetime' | 'over' | 'live';
}

export interface IGameStatePlayerState {
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

export interface IGameStatePlayerMatchStats {
	kills: number;
	assists: number;
	deaths: number;
	mvps: number;
	score: number;
}

export interface IGameStatePlayerWeapons {
	weapon_0: any;
	weapon_1: any;
	weapon_2: any;
	weapon_3: any;
}

export interface IGameStateLocalPlayer {
	steamid: string;
	clan: string;
	name: string;
	observer_slot: number;
	team: 'T' | 'CT';
	activity: 'playing' | 'free' | 'textinput' | 'menu';
	state: IGameStatePlayerState;
	matchStats: IGameStatePlayerMatchStats;
	weapons: IGameStatePlayerWeapons;
}

export interface IGameStatePlayer {}

export interface IGameStateAuth {
	token: string;
}

export default interface IGameState {
	provider: IGameStateProvider;
	map: IGameStateMap;
	round: IGameStateRound;
	player: IGameStateLocalPlayer;
	all_players: IGameStatePlayer;
	auth: IGameStateAuth;
}
