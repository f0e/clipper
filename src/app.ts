import 'dotenv/config';

import express from 'express';
import Game from './game';

const game = new Game();

game.addListener('change', (args) => {
	console.log('variable changed', args);
});

game.addListener('round.phase', ({ oldValue, value }) => {
	if (value == 'freezetime') {
		console.log('now in freezetime');
	}
});

const app = express();
const port = process.env.GAMESTATE_PORT || 47474;

app.use(express.json());

app.post('/', (req, res) => {
	game.update(req.body);
});

// start the server
app
	.listen(port, () => {
		console.log(`App started on port ${port}`);
	})
	.on('error', (e) => {
		console.log(`Fatal error: ${e.message}`);
	});
