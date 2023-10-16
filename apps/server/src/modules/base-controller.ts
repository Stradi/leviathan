import { Context, Env, Hono, Next } from 'hono';

export type ControllerResponse = Promise<Response> | Response;
export type Handler<Path extends string = '/', Environment extends Env = {}> = (
  ctx: Context<Environment, Path>,
  next?: Next
) => ControllerResponse;

export type Controller = {
  _app: Hono;
  router(): Hono;
};

export default class BaseController implements Controller {
  _app = new Hono();

  public router(): Hono {
    throw new Error('Method not implemented.');
  }
}
