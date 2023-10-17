import { bootstrapServer } from './bootstrap';
import { log } from './utils/logger';

log.info('Starting the Leviathan server');

const honoServer = bootstrapServer();
const server = Bun.serve({
  fetch: async (request, server) => {
    // Bun doesn't has request.connection.remoteAddress field. A workaround
    // is to use Bun's requestIP method to get the IP address of the client.
    const newRequest = new Request(request);
    const ip = server.requestIP(request);

    if (ip) {
      newRequest.headers.set('X-Bun-Family', ip.family);
      newRequest.headers.set('X-Bun-IP', ip.address);
      newRequest.headers.set('X-Bun-Port', ip.port.toString());
    }

    return await honoServer.fetch(newRequest, server);
  },
  port: process.env.PORT || 3001,
});

log.info(`Leviathan server is listening at http://${server.hostname}:${server.port}`);
