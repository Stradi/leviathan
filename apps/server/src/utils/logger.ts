import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: 'trace',
      options: {
        destination: `${process.cwd()}/logs/main.log`,
        mkdir: true,
      },
    },
    {
      target: 'pino/file',
      level: 'error',
      options: {
        destination: `${process.cwd()}/logs/error.log`,
        mkdir: true,
      },
    },
    {
      target: 'pino-pretty',
      level: 'trace',
      options: {},
    },
  ],
});

export const log = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
