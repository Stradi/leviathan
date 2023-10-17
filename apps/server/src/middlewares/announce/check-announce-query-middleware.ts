import { MiddlewareHandler } from 'hono';
import TrackerError from '../../utils/errors/tracker-error';
import { parseQueryParameters } from '../../utils/query';

// prettier-ignore
const BLACKLISTED_PORTS = [
  22, // SSH
  53, // DNS
  80, 81, 8080, 8081, // HTTP
  411, 412, 413, // Direct Connect
  443, // HTTPS
  1214, // Kazaa
  3389, // Windows Remote Desktop
  4662, // eDonkey
  6346, 6347, // Gnutella
  6699 // WinMX, Napster, etc...
]

const VALID_EVENTS = ['', 'started', 'stopped', 'completed', 'paused'];
export type AnnounceRequestVariable = {
  announce: {
    info_hash: string;
    peer_id: string;
    port: number;
    uploaded: number;
    downloaded: number;
    left: number;
    event: string;
    numwant: number;
    key: string;
  };
};

export default function checkAnnounceQueryMiddleware(): MiddlewareHandler<{
  Variables: AnnounceRequestVariable;
}> {
  return async (ctx, next) => {
    // ctx.req.query() throws an error. This is probably because info_hash contains non-ascii characters.
    // Because of that, we just parse the query string ourselves.
    const queryParams = parseQueryParameters(ctx.req.url);
    const values: Record<string, string | number> = queryParams as any;

    // Check if all of the required query parameters are present
    for (const param of ['info_hash', 'peer_id', 'port', 'uploaded', 'downloaded', 'left']) {
      if (!queryParams[param]) {
        throw new TrackerError({
          message: `Missing required query param: "${param}"`,
        });
      }
    }

    // Check if "info_hash" and "peer_id" is length of 20
    for (const param of ['info_hash', 'peer_id']) {
      if (queryParams[param].length !== 20) {
        throw new TrackerError({
          message: `Invalid "${param}" length. Length should be 20, but got ${queryParams[param].length}`,
        });
      }
    }

    // Check if "uploaded", "downloaded", "left" and "port" is numeric
    for (const param of ['uploaded', 'downloaded', 'left', 'port']) {
      if (!/^\d+$/.test(queryParams[param])) {
        throw new TrackerError({
          message: `Invalid "${param}" value. Value should be numeric, but got ${queryParams[param]}`,
        });
      }

      values[param] = parseInt(queryParams[param]);
    }

    // Extract optional query parameters. Fallback to sensible defaults
    for (const param of [
      {
        name: 'event',
        default: '',
      },
      {
        name: 'numwant',
        default: 25,
      },
      {
        name: 'key',
        default: '',
      },
    ]) {
      const value = queryParams[param.name];
      values[param.name] = value ?? param.default;
    }

    // Check if "numwant" is numeric
    if (!/^\d+$/.test(queryParams['numwant'])) {
      throw new TrackerError({
        message: `Invalid "numwant" value. Value should be numeric, but got ${values.numwant}`,
      });
    }

    // Check if "port" is between 0 and 65535 and is not blacklisted
    if (
      (values['port'] as number) < 0 ||
      (values['port'] as number) > 65535 ||
      BLACKLISTED_PORTS.includes(values['port'] as number)
    ) {
      throw new TrackerError({
        message: `Invalid "port" value. Value should be between 0 and 65535, but got ${values.port}`,
      });
    }

    // Check "event"
    values['event'] = values['event'].toString().toLowerCase();
    if (!VALID_EVENTS.includes(values.event.toString())) {
      throw new TrackerError({
        message: `Invalid "event" value. Value should be one of ${VALID_EVENTS.join(', ')}, but got ${values.event}`,
      });
    }

    // Check if "port" is valid based on the "event"
    if (values['port'] === 0 && values['event'] !== 'stopped') {
      throw new TrackerError({
        message: `Invalid "port" value. Value should be 0 if "event" is "stopped", but got ${values.port}`,
      });
    }

    // Set request level variable that has all the fields we've just checked.
    ctx.set('announce', values as AnnounceRequestVariable['announce']);

    await next();
  };
}
