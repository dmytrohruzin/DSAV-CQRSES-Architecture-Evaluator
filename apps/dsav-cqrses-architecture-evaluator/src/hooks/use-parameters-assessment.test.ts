import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_COMPLEXITY_COMPONENTS } from '../data/default-complexity-data'
import { DEFAULT_PERFORMANCE_METRICS, DEFAULT_PERFORMANCE_SCALE } from '../data/default-performance-data'
import type { Component } from '../lib/classification/types'
import { useParametersAssessment } from './use-parameters-assessment'

// With maxValue = 9 the fuzzy axis splits into 9 chunks of 1; pure zones are
// [0,1] → 4, [2,3] → 6, [4,5] → 8, so these inputs yield exact class values.
const PURE_ZONE_COMPONENT: Component = {
  name: 'Pure zones',
  activities: [
    { name: 'a1', designComplexity: 0.5, realizationComplexity: 2.5 },
    { name: 'a2', designComplexity: 2.5, realizationComplexity: 4.5 }
  ]
}

describe('useParametersAssessment — defaults', () => {
  it('exposes the default datasets and classificator settings', () => {
    const { result } = renderHook(() => useParametersAssessment())

    expect(result.current.components).toEqual(DEFAULT_COMPLEXITY_COMPONENTS)
    expect(result.current.designMaxValue).toBe(30)
    expect(result.current.realizationMaxValue).toBe(37)
    expect(result.current.designWeight).toBe(0.5)
    expect(result.current.realizationWeight).toBe(0.5)
    expect(result.current.performanceScale).toEqual(DEFAULT_PERFORMANCE_SCALE)
    expect(result.current.performanceMetrics).toEqual(DEFAULT_PERFORMANCE_METRICS)
  })

  it('computes one finite complexity row per default component', () => {
    const { result } = renderHook(() => useParametersAssessment())

    expect(result.current.complexityResults).toHaveLength(DEFAULT_COMPLEXITY_COMPONENTS.length)
    for (const row of result.current.complexityResults) {
      expect(Number.isFinite(row.designClass)).toBe(true)
      expect(Number.isFinite(row.realizationClass)).toBe(true)
      expect(Number.isFinite(row.total)).toBe(true)
    }
  })
})

describe('useParametersAssessment — complexity aggregation', () => {
  it('sums per-activity classes and applies the 0.5/0.5 weighted total', () => {
    const { result } = renderHook(() => useParametersAssessment())

    act(() => {
      result.current.handleSettingsChange({ designMaxValue: 9, realizationMaxValue: 9 })
      result.current.setComponents([PURE_ZONE_COMPONENT])
    })

    expect(result.current.complexityResults).toEqual([
      { name: 'Pure zones', designClass: 10, realizationClass: 14, total: 12, errors: [] }
    ])
  })

  it('applies updated design/realization weights to the total', () => {
    const { result } = renderHook(() => useParametersAssessment())

    act(() => {
      result.current.handleSettingsChange({ designMaxValue: 9, realizationMaxValue: 9 })
      result.current.setComponents([PURE_ZONE_COMPONENT])
      result.current.handleWeightsChange({ designWeight: 0.3, realizationWeight: 0.7 })
    })

    const row = result.current.complexityResults[0]
    expect(row?.total).toBeCloseTo(0.3 * 10 + 0.7 * 14, 10)
  })

  it('returns an empty result list when an axis maximum is not positive', () => {
    const { result } = renderHook(() => useParametersAssessment())

    act(() => {
      result.current.handleSettingsChange({ designMaxValue: 0, realizationMaxValue: 9 })
    })

    expect(result.current.complexityResults).toEqual([])
  })

  it('returns a zeroed row when an activity value exceeds the axis maximum', () => {
    const { result } = renderHook(() => useParametersAssessment())

    act(() => {
      result.current.handleSettingsChange({ designMaxValue: 9, realizationMaxValue: 9 })
      result.current.setComponents([
        {
          name: 'Out of range',
          activities: [{ name: 'a1', designComplexity: 10, realizationComplexity: 2.5 }]
        }
      ])
    })

    expect(result.current.complexityResults).toHaveLength(1)
    expect(result.current.complexityResults[0]).toMatchObject({
      name: 'Out of range',
      designClass: 0,
      realizationClass: 0,
      total: 0
    })
    expect(result.current.complexityResults[0]?.errors.length).toBeGreaterThan(0)
  })

  it('auto-calculates axis maximums from the current components', () => {
    const { result } = renderHook(() => useParametersAssessment())

    act(() => {
      result.current.setComponents([
        {
          name: 'A',
          activities: [{ name: 'a1', designComplexity: 3.2, realizationComplexity: 7.9 }]
        }
      ])
    })
    act(() => {
      result.current.handleAutoCalcMaxValues()
    })

    expect(result.current.designMaxValue).toBe(4)
    expect(result.current.realizationMaxValue).toBe(8)
  })
})
