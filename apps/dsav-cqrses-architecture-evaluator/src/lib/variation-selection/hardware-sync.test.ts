import { describe, expect, it } from 'vitest'
import { syncHardwareWithVariations } from './hardware-sync'
import type { SlaParameter, VariationHardwareData } from './types'

function sla(id: string): SlaParameter {
  return { id, name: id, unit: 'ms', direction: 'less-better', slaThreshold: 10 }
}

const HARDWARE: VariationHardwareData[] = [
  {
    variationName: 'A',
    configs: [{ id: 'a-1', name: 'cfg', pricePerMonthUsd: 100, slaValues: { p95: 5, stale: 1 } }]
  }
]

describe('syncHardwareWithVariations', () => {
  it('keeps blocks for existing variations and creates empty blocks for new ones', () => {
    const next = syncHardwareWithVariations(HARDWARE, ['A', 'B'], [sla('p95')])

    expect(next.map((h) => h.variationName)).toEqual(['A', 'B'])
    expect(next[0]?.configs).toHaveLength(1)
    expect(next[1]?.configs).toEqual([])
  })

  it('drops blocks for removed variations', () => {
    const next = syncHardwareWithVariations(HARDWARE, [], [sla('p95')])
    expect(next).toEqual([])
  })

  it('seeds NaN placeholders for newly added SLA parameters', () => {
    const next = syncHardwareWithVariations(HARDWARE, ['A'], [sla('p95'), sla('fresh')])

    const values = next[0]?.configs[0]?.slaValues
    expect(values?.p95).toBe(5)
    expect(Number.isNaN(values?.fresh)).toBe(true)
  })

  it('removes stale SLA values not present in the parameter list', () => {
    const next = syncHardwareWithVariations(HARDWARE, ['A'], [sla('p95')])

    expect(Object.keys(next[0]?.configs[0]?.slaValues ?? {})).toEqual(['p95'])
  })

  it('does not mutate the input configs', () => {
    syncHardwareWithVariations(HARDWARE, ['A'], [sla('p95')])

    expect(HARDWARE[0]?.configs[0]?.slaValues).toEqual({ p95: 5, stale: 1 })
  })
})
