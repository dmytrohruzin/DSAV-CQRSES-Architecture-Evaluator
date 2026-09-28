import { describe, expect, it } from 'vitest'

import type { GraphNode } from '../migration/types'
import { calculateFeasibility } from './feasibility'

function node(id: string, supportCost: number, hostingCost: number): GraphNode {
  return { id, name: id, supportCost, hostingCost }
}

describe('calculateFeasibility — fallback model (no migration timing)', () => {
  const source = node('a', 50, 100)
  const target = node('b', 120, 40)
  const hardwareUpgrade = { support: 50, hosting: 200 }

  it('returns the canonical ~5.56 months payback (instantaneous migration)', () => {
    const result = calculateFeasibility({
      source,
      target,
      path: [source, target],
      pathEdgeTimes: null,
      hardwareUpgrade,
      migrationCost: 500
    })
    expect(result.usesFallback).toBe(true)
    expect(result.monthlyNowTotal).toBe(150)
    expect(result.monthlyUpgradeTotal).toBe(250)
    expect(result.monthlyMigrationTotal).toBe(160)
    expect(result.monthlySavings).toBe(90)
    expect(result.migrationDurationMonths).toBeNull()
    expect(result.paybackMonths).toBeCloseTo(500 / 90, 4)
  })

  it('returns null payback when migration is not cheaper than upgrade', () => {
    const result = calculateFeasibility({
      source,
      target: node('b', 200, 100),
      path: null,
      pathEdgeTimes: null,
      hardwareUpgrade,
      migrationCost: 500
    })
    expect(result.usesFallback).toBe(true)
    expect(result.monthlySavings).toBeLessThan(0)
    expect(result.paybackMonths).toBeNull()
  })

  it('treats absent source/target as zero monthly totals', () => {
    const result = calculateFeasibility({
      source: null,
      target: null,
      path: null,
      pathEdgeTimes: null,
      hardwareUpgrade,
      migrationCost: 500
    })
    expect(result.monthlyNowTotal).toBe(0)
    expect(result.monthlyMigrationTotal).toBe(0)
    expect(result.usesFallback).toBe(true)
  })
})

describe('calculateFeasibility — step-by-step model (with migration timing)', () => {
  const hardwareUpgrade = { support: 50, hosting: 200 }

  it('uses the supplied edge times to run the simulation', () => {
    const source = node('a', 50, 100)
    const target = node('b', 120, 40)
    const result = calculateFeasibility({
      source,
      target,
      path: [source, target],
      pathEdgeTimes: [1.5],
      hardwareUpgrade,
      migrationCost: 500
    })
    expect(result.usesFallback).toBe(false)
    expect(result.migrationDurationMonths).toBe(1.5)
    expect(result.paybackMonths).not.toBeNull()
    expect(result.paybackMonths).toBeGreaterThan(0)
  })

  it('returns null payback when operational costs during migration eat the savings', () => {
    const source = node('a', 1000, 1000)
    const target = node('b', 200, 100)
    const result = calculateFeasibility({
      source,
      target,
      path: [source, target],
      pathEdgeTimes: [10],
      hardwareUpgrade,
      migrationCost: 500
    })
    expect(result.usesFallback).toBe(false)
    expect(result.paybackMonths).toBeNull()
  })

  it('handles a multi-edge path with per-segment timing', () => {
    const a = node('a', 50, 100)
    const b = node('b', 60, 100)
    const c = node('c', 70, 30)
    const result = calculateFeasibility({
      source: a,
      target: c,
      path: [a, b, c],
      pathEdgeTimes: [1, 0.5],
      hardwareUpgrade,
      migrationCost: 100
    })
    expect(result.usesFallback).toBe(false)
    expect(result.migrationDurationMonths).toBe(1.5)
    expect(result.paybackMonths).not.toBeNull()
  })
})
