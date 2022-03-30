import config, { loadConfig } from './config';
import startServer from './server/server';

// set up web server
startServer(config.ports.server);

// load config
loadConfig();
