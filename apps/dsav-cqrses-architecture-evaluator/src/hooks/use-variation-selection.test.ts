import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_COMPONENT_WEIGHTS } from '../data/default-component-weights'
import { DEFAULT_QUALITY_ATTRIBUTES } from '../data/default-quality-attributes'
import { DEFAULT_SLA_PARAMETERS } from '../data/default-sla-parameters'
import { useVariationSelection } from './use-variation-selection'

describe('useVariationSelection — defaults', () => {
  it('starts valid with the default dataset', () => {
    const { result } = renderHook(() => useVariationSelection())

    expect(result.current.attributes).toEqual(DEFAULT_QUALITY_ATTRIBUTES)
    expect(result.current.variations.map((v) => v.name)).toEqual(['Classical CQRS', 'mCQRS'])
    expect(result.current.slaParameters).toEqual(DEFAULT_SLA_PARAMETERS)
    expect(result.current.hardwareData.map((h) => h.variationName)).toEqual(['Classical CQRS', 'mCQRS'])
    expect(result.current.hardwareData[0]?.configs).toHaveLength(6)
    expect(result.current.swp).toBe(100)
    expect(result.current.results).toBeNull()
    expect(result.current.metricKeys).toHaveLength(12)
    expect(result.current.validationErrors).toEqual([])
    expect(result.current.invalidWeightAttributes).toEqual([])
    expect(result.current.isValid).toBe(true)
  })

  it('seeds component weights from the defaults for enabled attributes', () => {
    const { result } = renderHook(() => useVariationSelection())

    for (const attr of DEFAULT_QUALITY_ATTRIBUTES) {
      expect(result.current.componentWeights[attr.metricKey]).toEqual({
        template: 'value',
        value: DEFAULT_COMPONENT_WEIGHTS[attr.metricKey]
      })
    }
  })
})

describe('useVariationSelection — calculation', () => {
  it('computes all four result sets on calculate', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleCalculate()
    })

    const results = result.current.results
    expect(results).not.toBeNull()

    expect(results?.applicability).toHaveLength(2)
    const total = (results?.applicability ?? []).reduce((sum, r) => sum + r.applicability, 0)
    expect(total).toBeCloseTo(100, 0)

    expect(results?.relativeComplexity).toHaveLength(2)
    const minRows = (results?.relativeComplexity ?? []).filter((r) => r.isMin)
    expect(minRows).toHaveLength(1)
    expect(minRows[0]?.rc).toBe(1)

    expect(results?.optimal).toHaveLength(2)
    expect((results?.optimal ?? []).some((r) => r.isOptimal)).toBe(true)

    expect(results?.relativeHostingPrice).toHaveLength(2)
  })

  it('does not calculate when inputs are invalid', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleSwpChange(-1)
    })
    act(() => {
      result.current.handleCalculate()
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.results).toBeNull()
  })

  it('resets results whenever an input changes', () => {
    const { result } = renderHook(() => useVariationSelection())

    const calculateThen = (mutate: () => void) => {
      act(() => {
        result.current.handleCalculate()
      })
      expect(result.current.results).not.toBeNull()
      act(mutate)
      expect(result.current.results).toBeNull()
    }

    calculateThen(() => result.current.handleSwpChange(120))
    calculateThen(() => result.current.handleAttributesChange(result.current.attributes))
    calculateThen(() => result.current.handleVariationsChange(result.current.variations))
    calculateThen(() => result.current.handleSlaParametersChange(result.current.slaParameters))
    calculateThen(() => result.current.handleHardwareDataChange(result.current.hardwareData))
    calculateThen(() => result.current.handleComponentWeightValueChange('createDevelopment', 9))
    calculateThen(() => result.current.handleComponentWeightTemplateChange('createDevelopment', 'custom'))
  })
})

describe('useVariationSelection — validation', () => {
  it('flags non-positive metric values', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleVariationsChange(
        result.current.variations.map((v) =>
          v.name === 'mCQRS' ? { ...v, metrics: { ...v.metrics, createDevelopment: 0 } } : v
        )
      )
    })

    expect(result.current.validationErrors.length).toBeGreaterThan(0)
    expect(result.current.isValid).toBe(false)
  })

  it('flags non-positive component weights', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleComponentWeightValueChange('createDevelopment', 0)
    })

    expect(result.current.invalidWeightAttributes.map((a) => a.metricKey)).toEqual(['createDevelopment'])
    expect(result.current.isValid).toBe(false)
  })

  it('treats NaN weight input as zero (invalid)', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleComponentWeightValueChange('createDevelopment', Number.NaN)
    })

    expect(result.current.componentWeights.createDevelopment?.value).toBe(0)
    expect(result.current.isValid).toBe(false)
  })

  it('flags invalid swp', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleSwpChange(Number.NaN)
    })
    expect(result.current.isValid).toBe(false)
  })
})

describe('useVariationSelection — schema synchronization', () => {
  it('adds an empty hardware block for a new variation and reports missing metrics', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleVariationsChange([...result.current.variations, { name: 'V3', metrics: {} }])
    })

    expect(result.current.hardwareData.map((h) => h.variationName)).toEqual(['Classical CQRS', 'mCQRS', 'V3'])
    expect(result.current.hardwareData[2]?.configs).toEqual([])
    expect(result.current.isValid).toBe(false)
  })

  it('drops hardware blocks for removed variations', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleVariationsChange(result.current.variations.filter((v) => v.name === 'mCQRS'))
    })

    expect(result.current.hardwareData.map((h) => h.variationName)).toEqual(['mCQRS'])
  })

  it('seeds NaN placeholders in configs for newly added SLA parameters', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleSlaParametersChange([
        ...result.current.slaParameters,
        { id: 'newSla', name: 'New SLA', unit: 'ms', direction: 'less-better', slaThreshold: 1 }
      ])
    })

    for (const block of result.current.hardwareData) {
      for (const config of block.configs) {
        expect(Number.isNaN(config.slaValues.newSla)).toBe(true)
      }
    }
  })

  it('removes stale SLA values when an SLA parameter is deleted', () => {
    const { result } = renderHook(() => useVariationSelection())

    const remaining = DEFAULT_SLA_PARAMETERS.filter((p) => p.id !== 'errorRatePct')
    act(() => {
      result.current.handleSlaParametersChange(remaining)
    })

    for (const block of result.current.hardwareData) {
      for (const config of block.configs) {
        expect(Object.keys(config.slaValues).sort()).toEqual(remaining.map((p) => p.id).sort())
      }
    }
  })

  it('drops component weights for disabled attributes and keeps the rest', () => {
    const { result } = renderHook(() => useVariationSelection())

    act(() => {
      result.current.handleComponentWeightValueChange('updateDevelopment', 99)
    })
    act(() => {
      result.current.handleAttributesChange(
        result.current.attributes.map((a) => (a.metricKey === 'createDevelopment' ? { ...a, enabled: false } : a))
      )
    })

    expect(result.current.componentWeights.createDevelopment).toBeUndefined()
    expect(result.current.componentWeights.updateDevelopment?.value).toBe(99)
    expect(result.current.metricKeys).toHaveLength(11)
    expect(result.current.activeAttributes).toHaveLength(11)
  })
})
