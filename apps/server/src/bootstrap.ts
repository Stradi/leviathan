import { Hono } from 'hono';
import beNiceMiddleware from './middlewares/be-nice-middleware';
import TrackerController from './modules/tracker/tracker-controller';

export function bootstrapServer() {
  const app = new Hono();

  app.use('*', beNiceMiddleware());
  app.route('/tracker', new TrackerController().router());

  return app;
}
