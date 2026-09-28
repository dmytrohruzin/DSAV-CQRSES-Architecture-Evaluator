import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_MIGRATION_EDGES, DEFAULT_MIGRATION_NODES } from '../data/default-migration-graph'
import { useMigrationRoadmap } from './use-migration-roadmap'

describe('useMigrationRoadmap — defaults', () => {
  it('starts from the default graph with no computed result', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    expect(result.current.nodes).toEqual(DEFAULT_MIGRATION_NODES)
    expect(result.current.edges).toEqual(DEFAULT_MIGRATION_EDGES)
    expect(result.current.source).toBe('canonical-cqrs')
    expect(result.current.target).toBe('mcqrs-plus')
    expect(result.current.result).toBeNull()
    expect(result.current.highlightedPath).toBeNull()
    expect(result.current.sourceNode?.name).toBe('Canonical CQRS')
    expect(result.current.targetNode?.name).toBe('mCQRS+')
    expect(result.current.allPaths).toEqual([])
  })
})

describe('useMigrationRoadmap — pathfinding', () => {
  it('finds the lowest-effort path on the default graph', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleFindPath()
    })

    expect(result.current.result?.path).toEqual(['canonical-cqrs', 'mcqrs', 'mcqrs-plus'])
    expect(result.current.result?.totalEffort).toBeCloseTo(829.44 + 564.46, 10)
    expect(result.current.highlightedPath).toEqual(['canonical-cqrs', 'mcqrs', 'mcqrs-plus'])
  })

  it('resolves all viable paths with per-edge migration times, optimal first', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleFindPath()
    })

    const { allPaths } = result.current
    expect(allPaths).toHaveLength(2)

    // Reference edge: canonical→classical, effort 791.94, 1 month → 1/791.94 month/effort.
    const monthsPerEffort = 1 / 791.94
    expect(allPaths[0]?.id).toBe('canonical-cqrs→mcqrs→mcqrs-plus')
    expect(allPaths[0]?.pathNodes.map((n) => n.name)).toEqual(['Canonical CQRS', 'mCQRS', 'mCQRS+'])
    expect(allPaths[0]?.pathEdgeTimes).toHaveLength(2)
    expect(allPaths[0]?.pathEdgeTimes?.[0]).toBeCloseTo(829.44 * monthsPerEffort, 10)
    expect(allPaths[0]?.pathEdgeTimes?.[1]).toBeCloseTo(564.46 * monthsPerEffort, 10)

    expect(allPaths[1]?.id).toBe('canonical-cqrs→classical-cqrs→mcqrs→mcqrs-plus')
    expect(allPaths[1]?.pathEdgeTimes?.[0]).toBeCloseTo(1, 10)
    expect(allPaths[1]?.pathEdgeTimes?.[1]).toBeCloseTo(801.37 * monthsPerEffort, 10)
    expect(allPaths[1]?.pathEdgeTimes?.[2]).toBeCloseTo(564.46 * monthsPerEffort, 10)
  })

  it('resolves paths without edge times when no reference migration time exists', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleEdgesChange(DEFAULT_MIGRATION_EDGES.map(({ migrationTimeMonths: _, ...edge }) => edge))
    })
    act(() => {
      result.current.handleFindPath()
    })

    expect(result.current.allPaths.length).toBeGreaterThan(0)
    expect(result.current.allPaths[0]?.pathEdgeTimes).toBeNull()
  })

  it('stores an empty result when the target is unreachable', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleSourceChange('mcqrs-plus')
      result.current.handleTargetChange('canonical-cqrs')
    })
    act(() => {
      result.current.handleFindPath()
    })

    expect(result.current.result).toEqual({ path: [], totalEffort: 0, steps: [], alternatives: [] })
    expect(result.current.highlightedPath).toBeNull()
    expect(result.current.allPaths).toEqual([])
  })

  it('does nothing when source and target are the same', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleTargetChange('canonical-cqrs')
    })
    act(() => {
      result.current.handleFindPath()
    })

    expect(result.current.result).toBeNull()
  })
})

describe('useMigrationRoadmap — graph editing', () => {
  it('resets the result on edge changes', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleFindPath()
    })
    expect(result.current.result).not.toBeNull()

    act(() => {
      result.current.handleEdgesChange([...DEFAULT_MIGRATION_EDGES])
    })
    expect(result.current.result).toBeNull()
  })

  it('remaps source/target when their nodes are removed', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleNodesChange(DEFAULT_MIGRATION_NODES.filter((n) => n.id !== 'canonical-cqrs'))
    })

    expect(result.current.source).toBe('classical-cqrs')
    expect(result.current.target).toBe('mcqrs-plus')
    expect(result.current.result).toBeNull()
  })

  it('resets the result on source/target changes', () => {
    const { result } = renderHook(() => useMigrationRoadmap())

    act(() => {
      result.current.handleFindPath()
    })
    act(() => {
      result.current.handleSourceChange('classical-cqrs')
    })

    expect(result.current.source).toBe('classical-cqrs')
    expect(result.current.result).toBeNull()
  })
})
