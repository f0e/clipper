import EventEmitter from 'events';
import express, { Express, Router } from 'express';
import IGameState from '../../../types/gamestate.types';

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

		const detectChanges = (
			obj: any = this.state,
			keyHistory: string[] = []
		) => {
			for (const [key, value] of Object.entries(obj)) {
				const newKeyHistory = keyHistory.concat(key);

				if (typeof value == 'object') {
					detectChanges(value, newKeyHistory);
				} else {
					const keyPath = newKeyHistory.join('.');

					let oldValue = null;
					try {
						let cur: any = oldState;
						for (const historicKey of newKeyHistory) cur = cur[historicKey];
						oldValue = cur;
					} catch (e) {}

					if (oldValue != value) {
						this.emit(keyPath, { oldValue: oldValue, value });
						this.emit('change', {
							variable: keyPath,
							oldValue,
							value,
						});
					}
				}
			}
		};

		Object.assign(this.state, data);

		this.emit('update', {
			oldState,
			newState: this.state,
		});

		detectChanges();
	};
}

const gamestate = new GameState();
export default gamestate;
