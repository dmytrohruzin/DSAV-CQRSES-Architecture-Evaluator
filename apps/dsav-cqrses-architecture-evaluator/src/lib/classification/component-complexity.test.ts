import { describe, expect, it } from 'vitest'
import { computeComponentComplexity, computeMaxComplexitySettings } from './component-complexity'
import type { Component } from './types'

// With maxValue = 9 the fuzzy axis splits into 9 chunks of 1; pure zones are
// [0,1] → 4, [2,3] → 6, [4,5] → 8, so these inputs yield exact class values.
const SETTINGS = { designMaxValue: 9, realizationMaxValue: 9 }
const EQUAL_WEIGHTS = { designWeight: 0.5, realizationWeight: 0.5 }

const PURE_ZONE_COMPONENT: Component = {
  name: 'Pure zones',
  activities: [
    { name: 'a1', designComplexity: 0.5, realizationComplexity: 2.5 },
    { name: 'a2', designComplexity: 2.5, realizationComplexity: 4.5 }
  ]
}

describe('computeComponentComplexity', () => {
  it('sums per-activity classes and applies the weighted total', () => {
    const rows = computeComponentComplexity([PURE_ZONE_COMPONENT], SETTINGS, EQUAL_WEIGHTS)

    expect(rows).toEqual([{ name: 'Pure zones', designClass: 10, realizationClass: 14, total: 12, errors: [] }])
  })

  it('applies asymmetric weights to the total', () => {
    const rows = computeComponentComplexity([PURE_ZONE_COMPONENT], SETTINGS, {
      designWeight: 0.3,
      realizationWeight: 0.7
    })

    expect(rows[0]?.total).toBeCloseTo(0.3 * 10 + 0.7 * 14, 10)
  })

  it('returns an empty list when an axis maximum is not positive or not finite', () => {
    expect(
      computeComponentComplexity([PURE_ZONE_COMPONENT], { designMaxValue: 0, realizationMaxValue: 9 }, EQUAL_WEIGHTS)
    ).toEqual([])
    expect(
      computeComponentComplexity([PURE_ZONE_COMPONENT], { designMaxValue: 9, realizationMaxValue: -1 }, EQUAL_WEIGHTS)
    ).toEqual([])
    expect(
      computeComponentComplexity(
        [PURE_ZONE_COMPONENT],
        { designMaxValue: Number.NaN, realizationMaxValue: 9 },
        EQUAL_WEIGHTS
      )
    ).toEqual([])
  })

  it('zeroes the row and reports exceeds_max when a value is above the axis maximum', () => {
    const rows = computeComponentComplexity(
      [{ name: 'Over', activities: [{ name: 'big', designComplexity: 10, realizationComplexity: 2.5 }] }],
      SETTINGS,
      EQUAL_WEIGHTS
    )

    expect(rows[0]).toMatchObject({ name: 'Over', designClass: 0, realizationClass: 0, total: 0 })
    expect(rows[0]?.errors).toHaveLength(1)
    expect(rows[0]?.errors[0]).toMatchObject({ code: 'exceeds_max', field: 'big' })
  })

  it('zeroes the row and reports negative_value for negative activity values', () => {
    const rows = computeComponentComplexity(
      [{ name: 'Neg', activities: [{ name: 'bad', designComplexity: -1, realizationComplexity: 2.5 }] }],
      SETTINGS,
      EQUAL_WEIGHTS
    )

    expect(rows[0]).toMatchObject({ designClass: 0, realizationClass: 0, total: 0 })
    expect(rows[0]?.errors[0]).toMatchObject({ code: 'negative_value', field: 'bad' })
  })

  it('collects errors from multiple invalid activities', () => {
    const rows = computeComponentComplexity(
      [
        {
          name: 'Multi',
          activities: [
            { name: 'neg', designComplexity: -1, realizationComplexity: 1 },
            { name: 'over', designComplexity: 0.5, realizationComplexity: 99 }
          ]
        }
      ],
      SETTINGS,
      EQUAL_WEIGHTS
    )

    expect(rows[0]?.errors.map((e) => e.code)).toEqual(['negative_value', 'exceeds_max'])
  })

  it('labels unnamed activities with a question mark', () => {
    const rows = computeComponentComplexity(
      [{ name: 'NoName', activities: [{ name: '', designComplexity: -1, realizationComplexity: 1 }] }],
      SETTINGS,
      EQUAL_WEIGHTS
    )

    expect(rows[0]?.errors[0]?.field).toBe('?')
  })

  it('returns an empty list for no components', () => {
    expect(computeComponentComplexity([], SETTINGS, EQUAL_WEIGHTS)).toEqual([])
  })
})

describe('computeMaxComplexitySettings', () => {
  it('returns the ceil of the largest design/realization values', () => {
    const components: Component[] = [
      {
        name: 'A',
        activities: [
          { name: 'a1', designComplexity: 3.2, realizationComplexity: 7.9 },
          { name: 'a2', designComplexity: 5.1, realizationComplexity: 2 }
        ]
      },
      { name: 'B', activities: [{ name: 'b1', designComplexity: 4, realizationComplexity: 9.01 }] }
    ]

    expect(computeMaxComplexitySettings(components)).toEqual({ designMaxValue: 6, realizationMaxValue: 10 })
  })

  it('returns zeros for empty input', () => {
    expect(computeMaxComplexitySettings([])).toEqual({ designMaxValue: 0, realizationMaxValue: 0 })
  })
})
