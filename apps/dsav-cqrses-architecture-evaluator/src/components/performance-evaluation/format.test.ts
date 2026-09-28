import { describe, expect, it } from 'vitest'
import { formatScoreDescription } from './format'

describe('formatScoreDescription', () => {
  it('returns an empty string for null breakdowns', () => {
    expect(formatScoreDescription(null)).toBe('')
  })

  it('formats pure classes', () => {
    expect(formatScoreDescription({ kind: 'pure', score: 5 })).toBe('1 × 5 = 5.00')
  })

  it('formats interpolated classes with two-decimal weights', () => {
    expect(
      formatScoreDescription({
        kind: 'interpolated',
        lowerScore: 4,
        lowerWeight: 0.68,
        upperScore: 3,
        upperWeight: 0.32,
        score: 3.68
      })
    ).toBe('4 × 0.68 + 3 × 0.32 = 3.68')
  })
})
