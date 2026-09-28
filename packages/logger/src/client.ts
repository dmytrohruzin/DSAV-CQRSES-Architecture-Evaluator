/**
 * Browser / React-Native-safe logger.
 *
 * The server logger (`@dbbs/logger`) is Pino with worker-thread
 * transports — NOT safe to import into a browser or RN bundle. Use this
 * in client code: the same level-filtered shape over `console`. Pure —
 * the level is injected, no `process.env` reads.
 *
 * This is the one place `console` is the right sink: client logging in
 * a browser/RN bundle has nowhere else to go.
 */
export type ClientLogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface ClientLogger {
  debug(message: string, meta?: Record<string, unknown>): void
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
}

const ORDER: Record<ClientLogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export function createClientLogger(options: { level?: ClientLogLevel } = {}): ClientLogger {
  const threshold = ORDER[options.level ?? 'info']

  const emit = (level: ClientLogLevel, message: string, meta?: Record<string, unknown>): void => {
    if (ORDER[level] < threshold) return
    if (meta === undefined) {
      console[level](message)
    } else {
      console[level](message, meta)
    }
  }

  return {
    debug: (message, meta) => emit('debug', message, meta),
    info: (message, meta) => emit('info', message, meta),
    warn: (message, meta) => emit('warn', message, meta),
    error: (message, meta) => emit('error', message, meta)
  }
}

/** Default client logger (level `info`). */
export const clientLogger: ClientLogger = createClientLogger()
