import { describe, expect, it } from 'vitest'

import { sanitizeNumeric } from './utils'

describe('sanitizeNumeric', () => {
  it('parses integer strings', () => {
    expect(sanitizeNumeric('42')).toBe(42)
  })

  it('parses decimal strings', () => {
    expect(sanitizeNumeric('3.14')).toBe(3.14)
  })

  it('parses negative numbers', () => {
    expect(sanitizeNumeric('-5')).toBe(-5)
  })

  it('returns 0 for an empty string', () => {
    expect(sanitizeNumeric('')).toBe(0)
  })

  it('returns 0 for a non-numeric string', () => {
    expect(sanitizeNumeric('abc')).toBe(0)
  })

  it('parses the leading numeric prefix (parseFloat semantics)', () => {
    expect(sanitizeNumeric('12abc')).toBe(12)
  })

  it('ignores leading whitespace', () => {
    expect(sanitizeNumeric('  7')).toBe(7)
  })
})
