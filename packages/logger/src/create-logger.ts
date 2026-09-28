import pino, { type DestinationStream, type Level, type Logger } from 'pino'

export interface LoggerOptions {
  name?: string
  /** Pino level. Caller injects it (e.g. from validated env) — the
   *  package never reads `process.env`. */
  level?: Level
  /** Human-readable pino-pretty output. Server-only (worker transport);
   *  the caller decides based on its environment. */
  pretty?: boolean
  /** Where logs are written (defaults to stdout). Lets the app direct
   *  output and makes the logger testable. Ignored when `pretty` is set
   *  (pretty routes through a worker transport). */
  destination?: DestinationStream
}

const REDACT = {
  paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.secret', '*.token'],
  censor: '[REDACTED]'
}

/**
 * Create a structured Pino logger. Pure: all behaviour comes from
 * `options` — no `process.env` reads, so it is deterministic and
 * testable. Derive per-area loggers with `logger.child({ context })`
 * instead of creating more instances.
 *
 * - JSON output by default (machine-readable)
 * - `pretty: true` for human-readable dev output
 * - sensitive data masked via Pino redaction
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const { name = 'app', level = 'info', pretty = false, destination } = options

  const pinoOptions = {
    name,
    level,
    ...(pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    }),
    redact: REDACT
  }

  return destination ? pino(pinoOptions, destination) : pino(pinoOptions)
}

export type { Level as LogLevel, Logger }
