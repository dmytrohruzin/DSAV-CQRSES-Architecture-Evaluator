import { afterEach, describe, expect, it, vi } from 'vitest'
import { type ClientLogLevel, clientLogger, createClientLogger } from './client.js'

const LEVELS: ClientLogLevel[] = ['debug', 'info', 'warn', 'error']

function spyConsole() {
  return {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {})
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createClientLogger', () => {
  it('maps each level to the matching console method', () => {
    const spies = spyConsole()
    const log = createClientLogger({ level: 'debug' })
    for (const level of LEVELS) {
      log[level](`${level} message`)
      expect(spies[level]).toHaveBeenCalledWith(`${level} message`)
    }
  })

  it('passes meta as a second arg only when provided', () => {
    const spies = spyConsole()
    const log = createClientLogger({ level: 'debug' })

    log.error('with meta', { err: 'boom' })
    expect(spies.error).toHaveBeenCalledWith('with meta', { err: 'boom' })

    log.error('no meta')
    expect(spies.error).toHaveBeenLastCalledWith('no meta')
  })

  it('filters out levels below the configured threshold', () => {
    const spies = spyConsole()
    const log = createClientLogger({ level: 'warn' })

    log.debug('d')
    log.info('i')
    expect(spies.debug).not.toHaveBeenCalled()
    expect(spies.info).not.toHaveBeenCalled()

    log.warn('w')
    log.error('e')
    expect(spies.warn).toHaveBeenCalledWith('w')
    expect(spies.error).toHaveBeenCalledWith('e')
  })

  it('defaults to the `info` level (debug suppressed, info emitted)', () => {
    const spies = spyConsole()
    const log = createClientLogger()

    log.debug('hidden')
    log.info('shown')
    expect(spies.debug).not.toHaveBeenCalled()
    expect(spies.info).toHaveBeenCalledWith('shown')
  })

  it('exports a ready-to-use default `clientLogger` at info level', () => {
    const spies = spyConsole()
    clientLogger.debug('nope')
    clientLogger.warn('yep', { a: 1 })
    expect(spies.debug).not.toHaveBeenCalled()
    expect(spies.warn).toHaveBeenCalledWith('yep', { a: 1 })
  })
})
