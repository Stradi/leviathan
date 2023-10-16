import { Hono } from 'hono';

export function bootstrapServer() {
  const app = new Hono();

  return app;
}
