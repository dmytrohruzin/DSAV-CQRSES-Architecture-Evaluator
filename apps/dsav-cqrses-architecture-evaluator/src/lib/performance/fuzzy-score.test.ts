import { describe, expect, it } from 'vitest'
import {
  evaluatePerformanceMetrics,
  explainPerformanceScore,
  scorePerformance,
  validatePerformanceScale
} from './fuzzy-score'
import type { PerformanceScale } from './types'

const SCALE: PerformanceScale[] = [
  { threshold: 400, score: 1 },
  { threshold: 350, score: 2 },
  { threshold: 200, score: 3 },
  { threshold: 100, score: 4 },
  { threshold: 50, score: 5 }
]

describe('scorePerformance — fixture values', () => {
  it('returns the pure highest class below the lowest threshold', () => {
    expect(scorePerformance(43, SCALE)).toBe(5)
  })

  it('returns the pure lowest class above the highest threshold', () => {
    expect(scorePerformance(450, SCALE)).toBe(1)
  })

  it('interpolates inside a transition zone (132 ms → 3.68)', () => {
    expect(scorePerformance(132, SCALE)).toBeCloseTo(3.68, 10)
  })

  it('weights the midpoint evenly (150 ms → 3.5)', () => {
    expect(scorePerformance(150, SCALE)).toBeCloseTo(3.5, 10)
  })

  it('returns the threshold class for a value exactly on a threshold', () => {
    expect(scorePerformance(200, SCALE)).toBeCloseTo(3, 10)
  })

  it('returns 0 for an empty scale and for non-finite values', () => {
    expect(scorePerformance(100, [])).toBe(0)
    expect(scorePerformance(Number.NaN, SCALE)).toBe(0)
  })

  it('returns the lone level score for a single-level scale', () => {
    expect(scorePerformance(10, [{ threshold: 100, score: 2 }])).toBe(2)
  })
})

describe('explainPerformanceScore', () => {
  it('describes pure zones', () => {
    expect(explainPerformanceScore(43, SCALE)).toEqual({ kind: 'pure', score: 5 })
  })

  it('describes interpolated zones with both weights', () => {
    const breakdown = explainPerformanceScore(132, SCALE)
    expect(breakdown?.kind).toBe('interpolated')
    if (breakdown?.kind === 'interpolated') {
      expect(breakdown.lowerScore).toBe(4)
      expect(breakdown.lowerWeight).toBeCloseTo(0.68, 10)
      expect(breakdown.upperScore).toBe(3)
      expect(breakdown.upperWeight).toBeCloseTo(0.32, 10)
      expect(breakdown.score).toBeCloseTo(3.68, 10)
    }
  })

  it('treats duplicate thresholds (range 0) as the pure upper class', () => {
    const duplicated: PerformanceScale[] = [
      { threshold: 100, score: 2 },
      { threshold: 100, score: 3 }
    ]
    expect(explainPerformanceScore(100, duplicated)).toEqual({ kind: 'pure', score: 2 })
  })

  it('returns null for empty or invalid scales', () => {
    expect(explainPerformanceScore(100, [])).toBeNull()
    expect(explainPerformanceScore(100, [{ threshold: Number.NaN, score: 1 }])).toBeNull()
    expect(explainPerformanceScore(100, [{ threshold: -5, score: 1 }])).toBeNull()
  })
})

describe('validatePerformanceScale', () => {
  it('accepts a valid scale', () => {
    expect(validatePerformanceScale(SCALE)).toEqual([])
  })

  it('reports negative thresholds and non-finite scores', () => {
    const errors = validatePerformanceScale([{ threshold: -1, score: Number.NaN }])
    expect(errors.map((e) => e.code)).toEqual(['negative_value', 'non_finite'])
  })
})

describe('evaluatePerformanceMetrics', () => {
  it('scores every metric and keeps names', () => {
    const results = evaluatePerformanceMetrics(
      [
        { name: 'Read', responseTimeMs: 43 },
        { name: 'Write', responseTimeMs: 132 }
      ],
      SCALE
    )

    expect(results[0]).toMatchObject({ name: 'Read', score: 5 })
    expect(results[1]?.name).toBe('Write')
    expect(results[1]?.score).toBeCloseTo(3.68, 10)
  })
})
