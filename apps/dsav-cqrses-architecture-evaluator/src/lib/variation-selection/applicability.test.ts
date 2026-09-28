import { describe, expect, it } from 'vitest'

import { DEFAULT_CLASSICAL_CQRS_METRICS, DEFAULT_MCQRS_METRICS } from '../../data/default-params'
import { DEFAULT_QUALITY_ATTRIBUTES } from '../../data/default-quality-attributes'

import {
  calculateApplicabilityFromWeights,
  computeRelativeComplexity,
  validateApplicabilityInputs
} from './applicability'
import { getAllMetricKeys } from './quality-attributes'
import type { VariationMetrics } from './types'

function makeVariation(name: string, metrics: Record<string, number>): VariationMetrics {
  return { name, metrics }
}

const DEFAULT_METRIC_KEYS = getAllMetricKeys(DEFAULT_QUALITY_ATTRIBUTES)

const DEFAULT_VARIATIONS: VariationMetrics[] = [
  { name: 'Classical CQRS', metrics: DEFAULT_CLASSICAL_CQRS_METRICS },
  { name: 'mCQRS', metrics: DEFAULT_MCQRS_METRICS }
]

/** Equal weights for every key — keeps the math comparable to manual checks. */
function equalWeights(keys: string[]): Record<string, number> {
  const w: Record<string, number> = {}
  for (const k of keys) w[k] = 1
  return w
}

describe('computeRelativeComplexity', () => {
  const DEFAULT_WEIGHTS = equalWeights(DEFAULT_METRIC_KEYS)

  it('returns an empty array when no variations are provided', () => {
    expect(computeRelativeComplexity({}, [], DEFAULT_METRIC_KEYS)).toEqual([])
  })

  it('takes the simplest variation as the reference (rc = 1, isMin)', () => {
    const result = computeRelativeComplexity(DEFAULT_WEIGHTS, DEFAULT_VARIATIONS, DEFAULT_METRIC_KEYS)
    const reference = result.find((row) => row.isMin)

    expect(result.filter((row) => row.isMin)).toHaveLength(1)
    expect(reference?.name).toBe('mCQRS')
    expect(reference?.rc).toBe(1)
    for (const row of result) expect(row.rc).toBeGreaterThanOrEqual(1)
  })

  it('keeps rc of existing variations unchanged when a more complex one is added', () => {
    const heavy = makeVariation(
      'Heavy',
      Object.fromEntries(DEFAULT_METRIC_KEYS.map((key) => [key, (DEFAULT_CLASSICAL_CQRS_METRICS[key] ?? 1) * 4]))
    )

    const two = computeRelativeComplexity(DEFAULT_WEIGHTS, DEFAULT_VARIATIONS, DEFAULT_METRIC_KEYS)
    const three = computeRelativeComplexity(DEFAULT_WEIGHTS, [...DEFAULT_VARIATIONS, heavy], DEFAULT_METRIC_KEYS)

    expect(three[0]?.rc).toBeCloseTo(two[0]?.rc ?? 0, 10)
    expect(three[1]?.rc).toBeCloseTo(two[1]?.rc ?? 0, 10)
    expect(three[2]?.rc).toBeGreaterThan(three[0]?.rc ?? 0)
  })

  it('re-bases on a newly added variation that is simpler than the current reference', () => {
    const light = makeVariation(
      'Light',
      Object.fromEntries(DEFAULT_METRIC_KEYS.map((key) => [key, (DEFAULT_MCQRS_METRICS[key] ?? 1) / 2]))
    )

    const result = computeRelativeComplexity(DEFAULT_WEIGHTS, [...DEFAULT_VARIATIONS, light], DEFAULT_METRIC_KEYS)

    expect(result.find((row) => row.isMin)?.name).toBe('Light')
    expect(result[2]?.rc).toBe(1)
  })

  it('is insensitive to the order in which variations are supplied', () => {
    const forward = computeRelativeComplexity(DEFAULT_WEIGHTS, DEFAULT_VARIATIONS, DEFAULT_METRIC_KEYS)
    const reversed = computeRelativeComplexity(DEFAULT_WEIGHTS, [...DEFAULT_VARIATIONS].reverse(), DEFAULT_METRIC_KEYS)

    expect(reversed[1]?.rc).toBeCloseTo(forward[0]?.rc ?? 0, 10)
    expect(reversed[0]?.rc).toBeCloseTo(forward[1]?.rc ?? 0, 10)
  })

  it('scales rc by the metric ratio for proportionally heavier variations', () => {
    const result = computeRelativeComplexity(
      { m1: 1, m2: 1 },
      [makeVariation('Base', { m1: 10, m2: 10 }), makeVariation('Triple', { m1: 30, m2: 30 })],
      ['m1', 'm2']
    )

    expect(result[0]?.rc).toBe(1)
    expect(result[1]?.rc).toBeCloseTo(3, 10)
  })

  it('reports rc = 0 for every variation when no attribute is enabled', () => {
    const result = computeRelativeComplexity({}, DEFAULT_VARIATIONS, [])
    expect(result).toHaveLength(2)
    for (const row of result) {
      expect(row.rc).toBe(0)
      expect(row.r).toBe(0)
      expect(row.isMin).toBe(false)
    }
  })

  it('keeps r consistent with rc (r_i / r_min === rc_i)', () => {
    const result = computeRelativeComplexity(DEFAULT_WEIGHTS, DEFAULT_VARIATIONS, DEFAULT_METRIC_KEYS)
    const reference = result.find((row) => row.isMin)
    if (!reference) throw new Error('Expected a reference variation')

    for (const row of result) expect(row.r / reference.r).toBeCloseTo(row.rc, 2)
  })
})

describe('calculateApplicabilityFromWeights', () => {
  it('returns an empty array when no variations are provided', () => {
    expect(calculateApplicabilityFromWeights({}, [], DEFAULT_METRIC_KEYS)).toEqual([])
  })

  it('returns 100% for a single variation', () => {
    const first = DEFAULT_VARIATIONS[0]
    if (!first) throw new Error('Expected default variation to exist')
    const result = calculateApplicabilityFromWeights(equalWeights(DEFAULT_METRIC_KEYS), [first], DEFAULT_METRIC_KEYS)
    expect(result).toHaveLength(1)
    expect(result[0]?.applicability).toBeCloseTo(100, 1)
  })

  it('returns results summing to 100% with default complexity metrics', () => {
    const result = calculateApplicabilityFromWeights(
      equalWeights(DEFAULT_METRIC_KEYS),
      DEFAULT_VARIATIONS,
      DEFAULT_METRIC_KEYS
    )
    expect(result).toHaveLength(2)
    const sum = result.reduce((acc, r) => acc + r.applicability, 0)
    expect(sum).toBeCloseTo(100, 0)
  })

  it('returns equal 50% when two variations share identical metrics', () => {
    const identical: Record<string, number> = {}
    for (const key of DEFAULT_METRIC_KEYS) identical[key] = 10

    const variations = [makeVariation('A', identical), makeVariation('B', { ...identical })]

    const result = calculateApplicabilityFromWeights(equalWeights(DEFAULT_METRIC_KEYS), variations, DEFAULT_METRIC_KEYS)
    expect(result[0]?.applicability).toBeCloseTo(50, 1)
    expect(result[1]?.applicability).toBeCloseTo(50, 1)
  })

  it('returns ~33.33% per variation when three variations share identical metrics', () => {
    const identical: Record<string, number> = {}
    for (const key of DEFAULT_METRIC_KEYS) identical[key] = 10

    const variations = [
      makeVariation('A', identical),
      makeVariation('B', { ...identical }),
      makeVariation('C', { ...identical })
    ]
    const result = calculateApplicabilityFromWeights(equalWeights(DEFAULT_METRIC_KEYS), variations, DEFAULT_METRIC_KEYS)

    expect(result).toHaveLength(3)
    for (const r of result) expect(r.applicability).toBeCloseTo(33.33, 0)
  })

  it('gives a larger r_i to the variation with larger complexity metrics', () => {
    const weights = equalWeights(['m1', 'm2'])
    const variations = [makeVariation('Heavy', { m1: 100, m2: 100 }), makeVariation('Light', { m1: 10, m2: 10 })]

    const result = calculateApplicabilityFromWeights(weights, variations, ['m1', 'm2'])
    expect(result[0]?.name).toBe('Heavy')
    expect(result[1]?.name).toBe('Light')
    expect(result[0]?.applicability).toBeGreaterThan(result[1]?.applicability ?? 0)
  })

  it('respects per-metric weights when computing the integral score', () => {
    const variations = [makeVariation('A', { m1: 100, m2: 10 }), makeVariation('B', { m1: 10, m2: 100 })]
    // Heavier weight on m1: A (high m1) accrues more share than B.
    const heavyM1 = calculateApplicabilityFromWeights({ m1: 10, m2: 1 }, variations, ['m1', 'm2'])
    // Heavier weight on m2: B (high m2) accrues more share than A.
    const heavyM2 = calculateApplicabilityFromWeights({ m1: 1, m2: 10 }, variations, ['m1', 'm2'])

    expect(heavyM1[0]?.applicability).toBeGreaterThan(heavyM2[0]?.applicability ?? 0)
    expect(heavyM1[1]?.applicability).toBeLessThan(heavyM2[1]?.applicability ?? 0)
  })

  it('preserves variation names in the result order', () => {
    const result = calculateApplicabilityFromWeights(
      equalWeights(DEFAULT_METRIC_KEYS),
      DEFAULT_VARIATIONS,
      DEFAULT_METRIC_KEYS
    )
    expect(result[0]?.name).toBe('Classical CQRS')
    expect(result[1]?.name).toBe('mCQRS')
  })

  it('returns all-zero rows when every attribute is disabled (no metric keys)', () => {
    const result = calculateApplicabilityFromWeights({}, DEFAULT_VARIATIONS, [])
    expect(result).toHaveLength(2)
    for (const r of result) expect(r.applicability).toBe(0)
  })
})

describe('calculateApplicabilityFromWeights — defense-in-depth validation', () => {
  const variations = [makeVariation('A', { m1: 10 }), makeVariation('B', { m1: 20 })]

  it('returns an empty result when a metric is missing', () => {
    const broken = [makeVariation('A', { m1: 10 }), makeVariation('B', {})]
    expect(calculateApplicabilityFromWeights({ m1: 1 }, broken, ['m1'])).toEqual([])
  })

  it('returns an empty result when a metric is zero, negative or non-finite', () => {
    expect(calculateApplicabilityFromWeights({ m1: 1 }, [makeVariation('A', { m1: 0 })], ['m1'])).toEqual([])
    expect(calculateApplicabilityFromWeights({ m1: 1 }, [makeVariation('A', { m1: -3 })], ['m1'])).toEqual([])
    expect(calculateApplicabilityFromWeights({ m1: 1 }, [makeVariation('A', { m1: Number.NaN })], ['m1'])).toEqual([])
  })

  it('returns an empty result when a weight is negative or non-finite', () => {
    expect(calculateApplicabilityFromWeights({ m1: -1 }, variations, ['m1'])).toEqual([])
    expect(calculateApplicabilityFromWeights({ m1: Number.NaN }, variations, ['m1'])).toEqual([])
  })

  it('returns an empty result when all weights are zero', () => {
    expect(calculateApplicabilityFromWeights({ m1: 0 }, variations, ['m1'])).toEqual([])
  })
})

describe('validateApplicabilityInputs', () => {
  it('accepts valid inputs', () => {
    expect(
      validateApplicabilityInputs(equalWeights(DEFAULT_METRIC_KEYS), DEFAULT_VARIATIONS, DEFAULT_METRIC_KEYS)
    ).toEqual([])
  })

  it('accepts the empty-variations and empty-metric-keys edge cases', () => {
    expect(validateApplicabilityInputs(equalWeights(DEFAULT_METRIC_KEYS), [], DEFAULT_METRIC_KEYS)).toEqual([])
    expect(validateApplicabilityInputs({}, DEFAULT_VARIATIONS, [])).toEqual([])
  })

  it('reports missing_metric with variation and metric context', () => {
    const errors = validateApplicabilityInputs({ m1: 1 }, [makeVariation('B', {})], ['m1'])
    expect(errors[0]).toMatchObject({
      code: 'missing_metric',
      context: { variation: 'B', metricKey: 'm1' }
    })
  })

  it('reports invalid_value for non-positive metrics', () => {
    const errors = validateApplicabilityInputs({ m1: 1 }, [makeVariation('B', { m1: 0 })], ['m1'])
    expect(errors[0]?.code).toBe('invalid_value')
  })

  it('reports invalid_weight for negative weights and all-zero weights', () => {
    expect(validateApplicabilityInputs({ m1: -1 }, [], ['m1'])[0]?.code).toBe('invalid_weight')
    expect(validateApplicabilityInputs({ m1: 0 }, [], ['m1'])[0]?.code).toBe('invalid_weight')
  })
})
