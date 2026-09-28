import { describe, expect, it } from 'vitest'
import type { GraphNode } from '../migration/types'
import { pathLabel, summarizeMigrationPaths } from './path-summary'
import type { FeasibilityPath } from './types'

const nodeA: GraphNode = { id: 'a', name: 'A', supportCost: 50, hostingCost: 100 }
const nodeB: GraphNode = { id: 'b', name: 'B', supportCost: 120, hostingCost: 40 }
const nodeC: GraphNode = { id: 'c', name: 'C', supportCost: 60, hostingCost: 60 }

const directPath: FeasibilityPath = { id: 'a→b', pathNodes: [nodeA, nodeB], pathEdgeTimes: [1.5] }
const detourPath: FeasibilityPath = { id: 'a→c→b', pathNodes: [nodeA, nodeC, nodeB], pathEdgeTimes: [1, 1] }

describe('pathLabel', () => {
  it('joins node names with arrows', () => {
    expect(pathLabel(detourPath)).toBe('A → C → B')
  })
})

describe('summarizeMigrationPaths', () => {
  const args = {
    paths: [directPath, detourPath],
    migrationCosts: {},
    defaultMigrationCost: 500,
    monthlyUpgradeCost: 250
  }

  it('summarizes duration, cost and payback per path', () => {
    const rows = summarizeMigrationPaths(args)

    expect(rows[0]).toMatchObject({ id: 'a→b', label: 'A → B', duration: 1.5, cost: 500 })
    expect(rows[0]?.payback).toBeGreaterThan(0)
    expect(rows[1]).toMatchObject({ id: 'a→c→b', duration: 2, cost: 500 })
  })

  it('applies per-path cost overrides', () => {
    const rows = summarizeMigrationPaths({ ...args, migrationCosts: { 'a→c→b': 800 } })

    expect(rows[0]?.cost).toBe(500)
    expect(rows[1]?.cost).toBe(800)
  })

  it('skips payback without timing data', () => {
    const rows = summarizeMigrationPaths({
      ...args,
      paths: [{ id: 'a→b', pathNodes: [nodeA, nodeB], pathEdgeTimes: null }]
    })

    expect(rows[0]?.duration).toBeNull()
    expect(rows[0]?.payback).toBeNull()
  })

  it('skips payback for invalid costs or a non-positive upgrade total', () => {
    expect(summarizeMigrationPaths({ ...args, migrationCosts: { 'a→b': Number.NaN } })[0]?.payback).toBeNull()
    expect(summarizeMigrationPaths({ ...args, monthlyUpgradeCost: 0 })[0]?.payback).toBeNull()
  })
})
