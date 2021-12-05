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

export interface IGameStateAuth {
	token: string;
}

export default interface IGameState {
	map: IGameStateMap;
	round: IGameStateRound;
}
