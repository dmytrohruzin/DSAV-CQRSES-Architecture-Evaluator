import { describe, expect, it } from 'vitest'
import { buildDefaultComponentWeights, syncComponentWeightsWithAttributes } from './component-weights'
import type { QualityAttribute } from './types'

function attr(metricKey: string, enabled = true): QualityAttribute {
  return { name: metricKey, type: 'complexity', componentType: 'OQAC', enabled, metricKey, weightCriterion: '' }
}

const DEFAULTS = { m1: 7, m2: 3 }

describe('buildDefaultComponentWeights', () => {
  it('seeds weights for enabled attributes from the defaults', () => {
    const weights = buildDefaultComponentWeights([attr('m1'), attr('m2')], DEFAULTS)

    expect(weights).toEqual({
      m1: { template: 'value', value: 7 },
      m2: { template: 'value', value: 3 }
    })
  })

  it('skips disabled attributes and falls back to 1 for unknown keys', () => {
    const weights = buildDefaultComponentWeights([attr('m1', false), attr('mX')], DEFAULTS)

    expect(weights).toEqual({ mX: { template: 'value', value: 1 } })
  })
})

describe('syncComponentWeightsWithAttributes', () => {
  it('keeps existing weights for still-enabled attributes', () => {
    const prev = { m1: { template: 'custom', value: 42 } }
    const next = syncComponentWeightsWithAttributes(prev, [attr('m1'), attr('m2')], DEFAULTS)

    expect(next.m1).toEqual({ template: 'custom', value: 42 })
    expect(next.m2).toEqual({ template: 'value', value: 3 })
  })

  it('drops weights of disabled attributes', () => {
    const prev = { m1: { template: 'value', value: 7 }, m2: { template: 'value', value: 3 } }
    const next = syncComponentWeightsWithAttributes(prev, [attr('m1'), attr('m2', false)], DEFAULTS)

    expect(next).toEqual({ m1: { template: 'value', value: 7 } })
  })
})
