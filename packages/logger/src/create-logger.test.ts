import { describe, expect, it } from 'vitest'
import { createLogger } from './create-logger.js'

/** Collects the newline-delimited JSON pino writes to its destination. */
function capture() {
  const lines: Record<string, unknown>[] = []
  const destination = {
    write(chunk: string) {
      lines.push(JSON.parse(chunk) as Record<string, unknown>)
    }
  }
  return { destination, lines }
}

describe('createLogger', () => {
  it('writes machine-readable JSON with name, level and merged fields', () => {
    const { destination, lines } = capture()
    const log = createLogger({ name: 'svc', destination })

    log.info({ userId: 'u1' }, 'hello')

    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ name: 'svc', msg: 'hello', userId: 'u1', level: 30 })
  })

  it('redacts the configured sensitive paths, never emitting plaintext', () => {
    const { destination, lines } = capture()
    const log = createLogger({ destination })

    log.info(
      {
        req: { headers: { authorization: 'Bearer super-secret', cookie: 'sid=abc' } },
        user: { password: 'hunter2', token: 'tok_123', secret: 'sshh' }
      },
      'sensitive'
    )

    const raw = JSON.stringify(lines[0])
    expect(raw).not.toContain('super-secret')
    expect(raw).not.toContain('hunter2')
    expect(raw).not.toContain('tok_123')
    expect(raw).not.toContain('sshh')
    expect(raw).not.toContain('sid=abc')
    expect(raw.match(/\[REDACTED\]/g)?.length).toBe(5)
  })

  it('filters records below the configured level', () => {
    const { destination, lines } = capture()
    const log = createLogger({ level: 'warn', destination })

    log.info('suppressed')
    log.debug('suppressed')
    expect(lines).toHaveLength(0)

    log.warn('kept')
    log.error('kept')
    expect(lines.map((l) => l.msg)).toEqual(['kept', 'kept'])
  })

  it('defaults to the `info` level (debug suppressed, info emitted)', () => {
    const { destination, lines } = capture()
    const log = createLogger({ destination })

    log.debug('nope')
    log.info('yep')

    expect(lines.map((l) => l.msg)).toEqual(['yep'])
  })

  it('child loggers inherit name and add their context binding', () => {
    const { destination, lines } = capture()
    const child = createLogger({ name: 'api', destination }).child({ context: 'users' })

    child.info('created')

    expect(lines[0]).toMatchObject({ name: 'api', context: 'users', msg: 'created' })
  })
})
