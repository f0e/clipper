import express from 'express';
import 'express-async-errors';

import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// setup
const app = express();
const env = process.env.NODE_ENV || 'development';

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(morgan('tiny'));
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

// handle routes
import apiRouter from './routes/api';
app.use('/api/', apiRouter);

// serve static site in prod
if (env == 'production') {
	const root = path.join(__dirname, '../../../manager');

	app.use(express.static(root));
	app.get('*', (req, res) => {
		res.sendFile('index.html', { root });
	});
}

export default async function startServer() {
	const port = process.env.PORT || 3001;

	await app.listen(port).on('error', (e) => {
		console.log(`Fatal error: ${e.message}`);
	});

	console.log(`Server started on port ${port}`);
}
