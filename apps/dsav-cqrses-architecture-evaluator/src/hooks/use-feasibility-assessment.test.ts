import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GraphNode } from '../lib/migration/types'
import { type FeasibilityPath, useFeasibilityAssessment } from './use-feasibility-assessment'

const nodeA: GraphNode = { id: 'a', name: 'A', supportCost: 50, hostingCost: 100 }
const nodeB: GraphNode = { id: 'b', name: 'B', supportCost: 120, hostingCost: 40 }
const nodeC: GraphNode = { id: 'c', name: 'C', supportCost: 60, hostingCost: 60 }

const directPath: FeasibilityPath = { id: 'a→b', pathNodes: [nodeA, nodeB], pathEdgeTimes: [1.5] }
const detourPath: FeasibilityPath = { id: 'a→c→b', pathNodes: [nodeA, nodeC, nodeB], pathEdgeTimes: [1, 1] }

interface HookArgs {
  source: GraphNode | null
  target: GraphNode | null
  paths: FeasibilityPath[]
}

function renderFeasibility(initial: Partial<HookArgs> = {}) {
  return renderHook((args: HookArgs) => useFeasibilityAssessment(args), {
    initialProps: { source: nodeA, target: nodeB, paths: [directPath, detourPath], ...initial }
  })
}

describe('useFeasibilityAssessment — defaults and selection', () => {
  it('selects the recommended (first) path by default', () => {
    const { result } = renderFeasibility()

    expect(result.current.enabled).toBe(false)
    expect(result.current.recommendedId).toBe('a→b')
    expect(result.current.selectedPathId).toBe('a→b')
    expect(result.current.selectedPath).toEqual(directPath)
    expect(result.current.migrationCost).toBe(500)
  })

  it('switches the selected path and keeps per-path migration costs', () => {
    const { result } = renderFeasibility()

    act(() => {
      result.current.handleSelectPath('a→c→b')
    })
    expect(result.current.selectedPath).toEqual(detourPath)

    act(() => {
      result.current.handlePathCost('a→c→b', 800)
    })
    expect(result.current.migrationCost).toBe(800)

    act(() => {
      result.current.handleSelectPath('a→b')
    })
    expect(result.current.migrationCost).toBe(500)
  })

  it('falls back to the recommended path when the selected one disappears', () => {
    const { result, rerender } = renderFeasibility()

    act(() => {
      result.current.handleSelectPath('a→c→b')
    })
    rerender({ source: nodeA, target: nodeB, paths: [directPath] })

    expect(result.current.selectedPathId).toBe('a→b')
  })

  it('toggles the enabled flag', () => {
    const { result } = renderFeasibility()

    act(() => {
      result.current.handleToggle()
    })
    expect(result.current.enabled).toBe(true)
  })
})

describe('useFeasibilityAssessment — hardware upgrade scenario', () => {
  it('mirrors the source support cost and uses the default upgrade hosting', () => {
    const { result } = renderFeasibility()

    expect(result.current.hardwareSupport).toBe(nodeA.supportCost)
    expect(result.current.result.monthlyUpgradeTotal).toBe(nodeA.supportCost + 200)
  })

  it('treats a missing source as zero support cost', () => {
    const { result } = renderFeasibility({ source: null, paths: [] })

    expect(result.current.hardwareSupport).toBe(0)
  })

  it('recomputes the upgrade total when hosting changes', () => {
    const { result } = renderFeasibility()

    act(() => {
      result.current.handleHardwareHosting(300)
    })
    expect(result.current.result.monthlyUpgradeTotal).toBe(350)
    expect(result.current.monthlyUpgradeTotal).toBe(350)
  })
})

describe('useFeasibilityAssessment — feasibility result and path summary', () => {
  it('computes the timing-aware feasibility result for the selected path', () => {
    const { result } = renderFeasibility()

    expect(result.current.result.usesFallback).toBe(false)
    expect(result.current.result.monthlyNowTotal).toBe(150)
    expect(result.current.result.monthlyMigrationTotal).toBe(160)
    expect(result.current.result.migrationDurationMonths).toBe(1.5)
  })

  it('summarizes every path with duration, cost and payback', () => {
    const { result } = renderFeasibility()

    const summary = result.current.pathSummary
    expect(summary).toHaveLength(2)

    expect(summary[0]).toMatchObject({ id: 'a→b', label: 'A → B', duration: 1.5, cost: 500 })
    expect(summary[1]).toMatchObject({ id: 'a→c→b', label: 'A → C → B', duration: 2, cost: 500 })

    // The selected path's summary payback must agree with the main result.
    expect(summary[0]?.payback).not.toBeNull()
    if (summary[0]?.payback !== null && result.current.result.paybackMonths !== null) {
      expect(summary[0]?.payback).toBeCloseTo(result.current.result.paybackMonths, 10)
    }
  })

  it('uses per-path costs in the summary', () => {
    const { result } = renderFeasibility()

    act(() => {
      result.current.handlePathCost('a→c→b', 800)
    })

    expect(result.current.pathSummary[0]?.cost).toBe(500)
    expect(result.current.pathSummary[1]?.cost).toBe(800)
  })

  it('skips payback for paths without timing data', () => {
    const noTimes: FeasibilityPath = { id: 'a→b', pathNodes: [nodeA, nodeB], pathEdgeTimes: null }
    const { result } = renderFeasibility({ paths: [noTimes] })

    expect(result.current.pathSummary[0]?.duration).toBeNull()
    expect(result.current.pathSummary[0]?.payback).toBeNull()
    expect(result.current.result.usesFallback).toBe(true)
  })

  it('returns an empty summary without paths', () => {
    const { result } = renderFeasibility({ paths: [] })

    expect(result.current.selectedPath).toBeNull()
    expect(result.current.pathSummary).toEqual([])
  })
})
