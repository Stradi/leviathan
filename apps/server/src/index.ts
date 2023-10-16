import { bootstrapServer } from './bootstrap';

const honoServer = bootstrapServer();
const server = Bun.serve({
  fetch: honoServer.fetch,
  port: process.env.PORT || 3001,
});

console.log(`Leviathan server is listening at http://${server.hostname}:${server.port}`);
