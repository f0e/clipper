import EventEmitter from 'events';
import express, { Express, Router } from 'express';
import { IGameState } from './types/gamestate.types';

class GameState extends EventEmitter {
	state = {} as IGameState;
	router: Router;

	constructor(app: Express) {
		super();

		this.router = express.Router();

		this.router.post('/', (req, res) => {
			this.update(req.body);
		});

		app.use(this.router);
	}

	update = (data: unknown) => {
		const detectChanges = (obj: any, keyHistory: string[] = []) => {
			for (const [key, value] of Object.entries(obj)) {
				const newKeyHistory = keyHistory.concat(key);

				if (typeof value == 'object') {
					detectChanges(value, newKeyHistory);
				} else {
					const keyPath = newKeyHistory.join('.');

					let currentValue = null;
					try {
						let cur: any = this.state;
						for (const historicKey of newKeyHistory) cur = cur[historicKey];
						currentValue = cur;
					} catch (e) {}

					if (currentValue != value) {
						this.emit(keyPath, { oldValue: currentValue, value });
						this.emit('change', {
							variable: keyPath,
							oldValue: currentValue,
							value: value,
						});
					}
				}
			}
		};

		detectChanges(data);

		Object.assign(this.state, data);
	};
}

export default GameState;
