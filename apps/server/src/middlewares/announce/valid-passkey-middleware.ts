import { MiddlewareHandler } from 'hono';
import TrackerError from '../../utils/errors/tracker-error';

const PASSKEY_CHARS = 'abcdef0123456789';

export default function validPasskeyMiddleware(): MiddlewareHandler<{}, '/:passkey/announce'> {
  return async (ctx, next) => {
    const passkey = ctx.req.param('passkey');
    if (passkey.length !== 32) {
      throw new TrackerError({
        message: `Invalid "passkey" length. Length should be 32, but got ${passkey.length}`,
      });
    }

    if (!passkey.split('').every((char) => PASSKEY_CHARS.includes(char))) {
      throw new TrackerError({
        message: `Invalid "passkey" format. Should be in hex format.`,
      });
    }

    await next();
  };
}
