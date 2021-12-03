import EventEmitter from 'events';
import { GameState } from './types/gamestate.types';

class Game extends EventEmitter {
	state = {} as GameState;

	inWarmup = false;
	inFreezetime = false;

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

	emitEvents = () => {
		if (this.state.map.phase == 'warmup') {
			this.emit('warmup');
			this.inWarmup = true;
		} else {
			this.inWarmup = false;
		}

		if (this.state.round.phase == 'freezetime') {
			this.emit('freezetime');
			this.inFreezetime = true;
		} else {
			this.inFreezetime = false;
		}
	};
}

export default Game;
