import express from 'express';
import 'express-async-errors';

import helmet from 'helmet';
import morgan from 'morgan';

// setup
const app = express();

const port = process.env.PORT || 3001;

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('tiny'));
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

// handle routes
import apiRouter from './routes/api';
app.use('/', apiRouter);

export default async function startServer() {
	app
		.listen(port, () => {
			console.log(`App started on port ${port}`);
		})
		.on('error', (e) => {
			console.log(`Fatal error: ${e.message}`);
		});
}
