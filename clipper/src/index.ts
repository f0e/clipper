import 'dotenv/config';

import config, { loadConfig } from './config';
import startServer from './server/server';

// set up web server
startServer();

// load config
loadConfig();
