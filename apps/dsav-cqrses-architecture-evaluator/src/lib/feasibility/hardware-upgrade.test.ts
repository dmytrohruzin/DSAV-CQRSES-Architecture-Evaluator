import { describe, expect, it } from 'vitest'
import { deriveHardwareUpgradeSupport } from './hardware-upgrade'

describe('deriveHardwareUpgradeSupport', () => {
  it('mirrors the source node support cost', () => {
    expect(deriveHardwareUpgradeSupport({ id: 'a', name: 'A', supportCost: 50, hostingCost: 100 })).toBe(50)
  })

  it('returns 0 without a source', () => {
    expect(deriveHardwareUpgradeSupport(null)).toBe(0)
  })
})
