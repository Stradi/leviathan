import { bootstrapServer } from './bootstrap';
import { log } from './utils/logger';

log.info('Starting the Leviathan server');

const honoServer = bootstrapServer();
const server = Bun.serve({
  fetch: honoServer.fetch,
  port: process.env.PORT || 3001,
});

log.info(`Leviathan server is listening at http://${server.hostname}:${server.port}`);
