import { describe, expect, it } from 'vitest'

import { DEFAULT_HARDWARE_DATA } from './default-hardware-configurations'
import { DEFAULT_SLA_PARAMETERS } from './default-sla-parameters'

describe('DEFAULT_HARDWARE_DATA', () => {
  it('provides one block per default variation (Classical CQRS, mCQRS)', () => {
    expect(DEFAULT_HARDWARE_DATA).toHaveLength(2)
    expect(DEFAULT_HARDWARE_DATA[0]?.variationName).toBe('Classical CQRS')
    expect(DEFAULT_HARDWARE_DATA[1]?.variationName).toBe('mCQRS')
  })

  it('provides 6 hardware configs per variation', () => {
    for (const block of DEFAULT_HARDWARE_DATA) {
      expect(block.configs).toHaveLength(6)
    }
  })

  it('defines a value for every default SLA parameter on every config', () => {
    const slaIds = DEFAULT_SLA_PARAMETERS.map((sla) => sla.id)
    for (const block of DEFAULT_HARDWARE_DATA) {
      for (const config of block.configs) {
        for (const id of slaIds) {
          expect(Number.isFinite(config.slaValues[id])).toBe(true)
        }
      }
    }
  })

  it('gives every config a positive yearly price', () => {
    for (const block of DEFAULT_HARDWARE_DATA) {
      for (const config of block.configs) {
        expect(config.pricePerMonthUsd).toBeGreaterThan(0)
      }
    }
  })

  it('produces unique config ids across the dataset', () => {
    const ids = DEFAULT_HARDWARE_DATA.flatMap((block) => block.configs.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
