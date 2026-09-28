import { describe, expect, it } from 'vitest'

import {
  collect,
  finiteNumber,
  isFiniteNumber,
  isNonNegativeFinite,
  isPositiveFinite,
  nonNegativeNumber,
  numberAtMost,
  positiveNumber
} from './validators'

describe('predicates', () => {
  it('isFiniteNumber accepts finite numbers and rejects NaN/Infinity', () => {
    expect(isFiniteNumber(0)).toBe(true)
    expect(isFiniteNumber(-3.5)).toBe(true)
    expect(isFiniteNumber(Number.NaN)).toBe(false)
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false)
  })

  it('isPositiveFinite requires > 0', () => {
    expect(isPositiveFinite(0.001)).toBe(true)
    expect(isPositiveFinite(0)).toBe(false)
    expect(isPositiveFinite(-1)).toBe(false)
    expect(isPositiveFinite(Number.NaN)).toBe(false)
  })

  it('isNonNegativeFinite requires ≥ 0', () => {
    expect(isNonNegativeFinite(0)).toBe(true)
    expect(isNonNegativeFinite(5)).toBe(true)
    expect(isNonNegativeFinite(-0.1)).toBe(false)
    expect(isNonNegativeFinite(Number.POSITIVE_INFINITY)).toBe(false)
  })
})

describe('validators', () => {
  it('finiteNumber returns no errors for valid input', () => {
    expect(finiteNumber(1.5, 'x')).toEqual([])
  })

  it('finiteNumber reports non_finite with field and context', () => {
    const errors = finiteNumber(Number.NaN, 'swp')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchObject({ code: 'non_finite', field: 'swp' })
    expect(errors[0]?.message).toContain('swp')
  })

  it('positiveNumber reports not_positive for zero', () => {
    expect(positiveNumber(1, 'price')).toEqual([])
    expect(positiveNumber(0, 'price')[0]?.code).toBe('not_positive')
    expect(positiveNumber(Number.NaN, 'price')[0]?.code).toBe('not_positive')
  })

  it('nonNegativeNumber reports negative_value below zero', () => {
    expect(nonNegativeNumber(0, 'cost')).toEqual([])
    expect(nonNegativeNumber(-1, 'cost')[0]?.code).toBe('negative_value')
  })

  it('numberAtMost reports exceeds_max above the bound', () => {
    expect(numberAtMost(5, 10, 'value')).toEqual([])
    expect(numberAtMost(11, 10, 'value')[0]?.code).toBe('exceeds_max')
    expect(numberAtMost(Number.NaN, 10, 'value')[0]?.code).toBe('exceeds_max')
  })

  it('collect flattens error groups', () => {
    const errors = collect(positiveNumber(0, 'a'), nonNegativeNumber(-1, 'b'), finiteNumber(1, 'c'))
    expect(errors.map((e) => e.code)).toEqual(['not_positive', 'negative_value'])
  })
})
