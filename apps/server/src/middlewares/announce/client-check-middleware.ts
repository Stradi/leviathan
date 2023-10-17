import { MiddlewareHandler } from 'hono';
import TrackerError from '../../utils/errors/tracker-error';
import { parseQueryParameters } from '../../utils/query';

const USER_AGENT_REGEX = /(Mozilla|Browser|Chrome|Safari|AppleWebKit|Opera|Links|Lynx|Bot|Unknown)/i;

export default function clientCheckMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const clientIpAddress = ctx.req.header('X-Bun-IP');
    if (!clientIpAddress) {
      throw new TrackerError({
        message: 'IP Address should be exist',
      });
    }

    const queries = parseQueryParameters(ctx.req.url);
    if (Object.keys(queries).length < 6) {
      throw new TrackerError({ message: 'At least 6 query params are required' });
    }

    const userAgent = ctx.req.header('User-Agent');
    if (!userAgent) {
      throw new TrackerError({ message: 'User-Agent header is required' });
    }

    // Probably browser or crawler. We should block it.
    if (
      ctx.req.header('Accept-Language') ||
      ctx.req.header('Referrer') ||
      ctx.req.header('Accept-Charset') ||
      ctx.req.header('Want-Digest')
    ) {
      throw new TrackerError({ message: 'Browser or crawler are not allowed' });
    }

    if (userAgent.length > 64) {
      throw new TrackerError({
        message: `Invalid "User-Agent" length. Length should be less than 64, but got ${userAgent.length}`,
      });
    }

    // Block browser user agents
    if (USER_AGENT_REGEX.test(userAgent)) {
      throw new TrackerError({ message: 'Browser or crawler are not allowed' });
    }

    await next();
  };
}
