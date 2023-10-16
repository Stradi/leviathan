import checkAnnounceQueryMiddleware, {
  AnnounceRequestVariable,
} from '../../middlewares/announce/check-announce-query-middleware';
import clientCheckMiddleware from '../../middlewares/announce/client-check-middleware';
import validPasskeyMiddleware from '../../middlewares/announce/valid-passkey-middleware';
import BaseController, { Handler } from '../base-controller';

// All of these checks and middlewares are inspired by UNIT3D tracker.
// Source: https://github.com/HDInnovations/UNIT3D-Community-Edition/blob/master/app/Http/Controllers/AnnounceController.php
export default class TrackerController extends BaseController {
  public router() {
    this._app.get(
      '/:passkey/announce',
      clientCheckMiddleware(),
      checkAnnounceQueryMiddleware(),
      validPasskeyMiddleware(),
      this.announce
    );

    return this._app;
  }

  public announce: Handler<
    '/:passkey/announce',
    {
      Variables: AnnounceRequestVariable;
    }
  > = (ctx) => {
    console.log(JSON.stringify(ctx.var));

    return new Response(ctx.req.param('passkey'), {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  };
}
