import { describe, expect, it } from 'vitest'

import {
  computeEdgeFullWeight,
  computeEdgeMigrationTimes,
  simulatePayback,
  simulatePaybackBreakdown
} from './migration-timing'
import type { GraphEdge, GraphNode } from './types'

function edge(from: string, to: string, effort: number, migrationTimeMonths?: number): GraphEdge {
  return migrationTimeMonths === undefined ? { from, to, effort } : { from, to, effort, migrationTimeMonths }
}

function node(id: string, supportCost: number, hostingCost: number): GraphNode {
  return { id, name: id, supportCost, hostingCost }
}

describe('computeEdgeMigrationTimes', () => {
  it('scales every edge by the first reference (effort 10 → 1 month sets ratio 0.1)', () => {
    const times = computeEdgeMigrationTimes([
      edge('a', 'b', 15),
      edge('c', 'd', 22.5),
      edge('e', 'f', 10, 1),
      edge('g', 'h', 7)
    ])
    expect(times).not.toBeNull()
    if (times === null) throw new Error('expected non-null times')
    const expected = [1.5, 2.25, 1, 0.7]
    expect(times).toHaveLength(expected.length)
    expected.forEach((v, i) => {
      expect(times[i]).toBeCloseTo(v, 10)
    })
  })

  it('returns null when no edge has a reference migration time', () => {
    expect(computeEdgeMigrationTimes([edge('a', 'b', 15), edge('c', 'd', 22.5)])).toBeNull()
  })

  it('returns null for an empty edge list', () => {
    expect(computeEdgeMigrationTimes([])).toBeNull()
  })

  it('uses the first valid reference and ignores subsequent ones', () => {
    const times = computeEdgeMigrationTimes([
      edge('a', 'b', 20, 2), // ratio 0.1
      edge('c', 'd', 10, 5) // ignored as reference
    ])
    expect(times).toEqual([2, 1])
  })

  it('ignores reference candidates with non-positive effort or time', () => {
    const times = computeEdgeMigrationTimes([
      edge('a', 'b', 0, 5), // bad — effort = 0
      edge('c', 'd', 10, 0), // bad — time = 0
      edge('e', 'f', 20, 4) // ratio 0.2
    ])
    expect(times).toEqual([0, 2, 4])
  })
})

describe('computeEdgeFullWeight', () => {
  const fromA = node('a', 50, 100)

  it('returns effort + ops × time', () => {
    expect(computeEdgeFullWeight(edge('a', 'b', 15), fromA, 1.5)).toBeCloseTo(15 + 150 * 1.5, 6)
  })

  it('returns null when migrationTime is null', () => {
    expect(computeEdgeFullWeight(edge('a', 'b', 15), fromA, null)).toBeNull()
  })

  it('returns null when fromNode is undefined', () => {
    expect(computeEdgeFullWeight(edge('a', 'b', 15), undefined, 1)).toBeNull()
  })

  it('returns null when migrationTime is negative', () => {
    expect(computeEdgeFullWeight(edge('a', 'b', 15), fromA, -1)).toBeNull()
  })

  it('handles zero migrationTime gracefully', () => {
    expect(computeEdgeFullWeight(edge('a', 'b', 15), fromA, 0)).toBe(15)
  })
})

describe('simulatePayback', () => {
  it('finds the crossing inside the first segment (cheap migration cost)', () => {
    // path: A → B, edgeTime 1.5 month, A = 50/100, B = 120/40
    // migrationCost = 5 at t=0; upgrade = 250/mo
    // Segment 1 (on A): slopeMig = 150, slopeUpg = 250, gap = 5 → dt = 5/100 = 0.05
    const result = simulatePayback({
      path: [node('a', 50, 100), node('b', 120, 40)],
      edgeTimes: [1.5],
      migrationCost: 5,
      monthlyUpgradeCost: 250
    })
    expect(result).toBeCloseTo(0.05, 4)
  })

  it('finds the crossing after the migration window (operational on target)', () => {
    // path: A → B, edgeTime 1.5 month, A = 50/100, B = 120/40
    // migrationCost = 1000 (high), upgrade = 250/mo
    // Segment 1 (on A): gap_after = 1000 + 150·1.5 − 250·1.5 = 1000 − 150 = 850
    // Segment 2 (on B forever): slopeMig = 160 → slopeDiff = 90 → dt = 850/90 ≈ 9.444
    // payback = 1.5 + 9.444 ≈ 10.944
    const result = simulatePayback({
      path: [node('a', 50, 100), node('b', 120, 40)],
      edgeTimes: [1.5],
      migrationCost: 1000,
      monthlyUpgradeCost: 250
    })
    expect(result).toBeCloseTo(1.5 + 850 / 90, 3)
  })

  it('returns null when migration is never cheaper than the upgrade (target ops too high)', () => {
    const result = simulatePayback({
      path: [node('a', 50, 100), node('b', 300, 100)],
      edgeTimes: [1.5],
      migrationCost: 500,
      monthlyUpgradeCost: 250
    })
    expect(result).toBeNull()
  })

  it('walks multiple segments correctly across a 3-edge path', () => {
    // A → B → C → D, edges 1/1/1, A=10/10, B=20/20, C=30/30, D=5/5
    // migrationCost = 0, upgrade = 100/mo
    // Seg 1 (A, 20/mo): slopeDiff = 80, gap = 0 → instant payback at t=0
    const result = simulatePayback({
      path: [node('a', 10, 10), node('b', 20, 20), node('c', 30, 30), node('d', 5, 5)],
      edgeTimes: [1, 1, 1],
      migrationCost: 0,
      monthlyUpgradeCost: 100
    })
    expect(result).toBe(0)
  })

  it('returns null when the path is shorter than two nodes', () => {
    expect(
      simulatePayback({
        path: [node('a', 10, 10)],
        edgeTimes: [],
        migrationCost: 0,
        monthlyUpgradeCost: 100
      })
    ).toBeNull()
  })

  it('returns null when edgeTimes length does not match path length − 1', () => {
    expect(
      simulatePayback({
        path: [node('a', 10, 10), node('b', 10, 10)],
        edgeTimes: [],
        migrationCost: 0,
        monthlyUpgradeCost: 100
      })
    ).toBeNull()
  })

  it('returns null when monthlyUpgradeCost is non-positive (no comparison possible)', () => {
    expect(
      simulatePayback({
        path: [node('a', 10, 10), node('b', 10, 10)],
        edgeTimes: [1],
        migrationCost: 0,
        monthlyUpgradeCost: 0
      })
    ).toBeNull()
  })
})

describe('simulatePaybackBreakdown', () => {
  it('returns one initial + N edge + 1 target segments and reports payback', () => {
    const a = node('a', 50, 100)
    const b = node('b', 120, 40)
    const result = simulatePaybackBreakdown({
      path: [a, b],
      edgeTimes: [1.5],
      migrationCost: 1000,
      monthlyUpgradeCost: 250
    })

    expect(result).not.toBeNull()
    if (!result) throw new Error('expected breakdown')

    expect(result.segments).toHaveLength(3)
    expect(result.segments[0]?.kind).toBe('initial')
    expect(result.segments[0]?.cumMigration).toBe(1000)
    expect(result.segments[0]?.cumUpgrade).toBe(0)
    expect(result.segments[1]?.kind).toBe('edge')
    expect(result.segments[1]?.fromName).toBe('a')
    expect(result.segments[1]?.toName).toBe('b')
    // After segment 1: cumMig = 1000 + 150·1.5 = 1225, cumUpg = 250·1.5 = 375
    expect(result.segments[1]?.cumMigration).toBe(1225)
    expect(result.segments[1]?.cumUpgrade).toBe(375)
    expect(result.segments[2]?.kind).toBe('target')
    expect(result.segments[2]?.paybackReached).toBe(true)
    expect(result.paybackMonths).toBeCloseTo(1.5 + 850 / 90, 3)
  })

  it('marks the edge segment as the one where payback is reached when it falls inside the migration window', () => {
    const a = node('a', 50, 100)
    const b = node('b', 120, 40)
    const result = simulatePaybackBreakdown({
      path: [a, b],
      edgeTimes: [1.5],
      migrationCost: 5,
      monthlyUpgradeCost: 250
    })

    expect(result?.segments[1]?.paybackReached).toBe(true)
    expect(result?.segments[2]?.paybackReached).toBe(false)
    expect(result?.paybackMonths).toBeCloseTo(0.05, 4)
  })

  it('returns paybackMonths = null and a non-reached target tail when migration never wins', () => {
    const a = node('a', 50, 100)
    const b = node('b', 300, 100)
    const result = simulatePaybackBreakdown({
      path: [a, b],
      edgeTimes: [1.5],
      migrationCost: 500,
      monthlyUpgradeCost: 250
    })

    expect(result?.paybackMonths).toBeNull()
    expect(result?.segments.at(-1)?.paybackReached).toBe(false)
  })

  it('returns null for invalid inputs (path too short)', () => {
    expect(
      simulatePaybackBreakdown({
        path: [node('a', 10, 10)],
        edgeTimes: [],
        migrationCost: 0,
        monthlyUpgradeCost: 100
      })
    ).toBeNull()
  })
})
