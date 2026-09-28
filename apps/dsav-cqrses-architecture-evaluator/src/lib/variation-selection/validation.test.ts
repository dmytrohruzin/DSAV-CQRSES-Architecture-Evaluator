import { describe, expect, it } from 'vitest'
import type { ComponentWeights, QualityAttribute, VariationMetrics } from './types'
import { findInvalidWeightAttributes, validateSelectionInputs, validateSwp } from './validation'

function attr(metricKey: string, enabled = true): QualityAttribute {
  return { name: metricKey, type: 'complexity', componentType: 'OQAC', enabled, metricKey, weightCriterion: '' }
}

const ATTRIBUTES = [attr('m1'), attr('m2')]
const VARIATIONS: VariationMetrics[] = [
  { name: 'A', metrics: { m1: 10, m2: 5 } },
  { name: 'B', metrics: { m1: 8, m2: 4 } }
]
const WEIGHTS: ComponentWeights = {
  m1: { template: 'value', value: 7 },
  m2: { template: 'value', value: 3 }
}

describe('findInvalidWeightAttributes', () => {
  it('returns nothing when every enabled attribute has a positive weight', () => {
    expect(findInvalidWeightAttributes(ATTRIBUTES, WEIGHTS)).toEqual([])
  })

  it('flags missing, zero and non-finite weights', () => {
    const broken: ComponentWeights = { m1: { template: 'value', value: 0 } }
    const invalid = findInvalidWeightAttributes(ATTRIBUTES, broken)

    expect(invalid.map((a) => a.metricKey)).toEqual(['m1', 'm2'])
  })

  it('ignores disabled attributes', () => {
    expect(findInvalidWeightAttributes([attr('m1', false)], {})).toEqual([])
  })
})

describe('validateSwp', () => {
  it('accepts zero and positive finite values', () => {
    expect(validateSwp(0)).toEqual([])
    expect(validateSwp(100)).toEqual([])
  })

  it('rejects negative and non-finite values', () => {
    expect(validateSwp(-1)[0]?.code).toBe('invalid_swp')
    expect(validateSwp(Number.NaN)[0]?.code).toBe('invalid_swp')
  })
})

describe('validateSelectionInputs', () => {
  const VALID = { attributes: ATTRIBUTES, variations: VARIATIONS, componentWeights: WEIGHTS, swp: 100 }

  it('accepts a fully valid input set', () => {
    expect(validateSelectionInputs(VALID)).toEqual([])
  })

  it('reports missing variations', () => {
    const errors = validateSelectionInputs({ ...VALID, variations: [] })
    expect(errors.map((e) => e.code)).toContain('missing_variations')
  })

  it('reports metric, weight and swp problems together', () => {
    const errors = validateSelectionInputs({
      attributes: ATTRIBUTES,
      variations: [{ name: 'A', metrics: { m1: 0 } }],
      componentWeights: { m1: { template: 'value', value: 0 } },
      swp: -5
    })

    const codes = errors.map((e) => e.code)
    expect(codes).toContain('invalid_value')
    expect(codes).toContain('missing_metric')
    expect(codes).toContain('invalid_weight')
    expect(codes).toContain('invalid_swp')
  })
})
