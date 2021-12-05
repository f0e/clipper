import EventEmitter from 'events';
import express, { Express, Router } from 'express';
import IGameState from '../../../types/gamestate.types';
import * as helpers from '../util/helpers';

export class GameState extends EventEmitter {
	state = {} as IGameState;
	router: Router;

	constructor() {
		super();

		this.router = express.Router();

		this.router.post('/', (req, res) => {
			this.update(req.body);
		});
	}
	initialise = (app: Express) => {
		app.use(this.router);
	};

	update = (data: unknown) => {
		const oldState = {} as IGameState;
		Object.assign(oldState, this.state);

		Object.assign(this.state, data);

		this.emit('update', {
			oldState,
			newState: this.state,
		});

		helpers.detectChanges(
			oldState,
			this.state,
			(oldValue: any, newValue: any, modifiedKey: string[]) => {
				const keyPath = modifiedKey.join('.');

				this.emit(keyPath, { oldValue: oldValue, value: newValue });

				this.emit('change', {
					variable: keyPath,
					oldValue: oldValue,
					value: newValue,
				});
			}
		);
	};
}

const gamestate = new GameState();
export default gamestate;
