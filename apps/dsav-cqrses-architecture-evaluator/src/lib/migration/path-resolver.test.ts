import { describe, expect, it } from 'vitest'
import { createPathResolver, resolveCandidatePaths } from './path-resolver'
import type { GraphEdge, GraphNode } from './types'

const NODES: GraphNode[] = [
  { id: 'a', name: 'A', supportCost: 10, hostingCost: 10 },
  { id: 'b', name: 'B', supportCost: 20, hostingCost: 20 },
  { id: 'c', name: 'C', supportCost: 30, hostingCost: 30 }
]

// Reference edge a→b: effort 10, 1 month → 0.1 month per effort unit.
const EDGES: GraphEdge[] = [
  { from: 'a', to: 'b', effort: 10, migrationTimeMonths: 1 },
  { from: 'b', to: 'c', effort: 5 }
]

describe('createPathResolver', () => {
  it('resolves node IDs into nodes with proportional edge times', () => {
    const resolve = createPathResolver(NODES, EDGES)

    const { pathNodes, pathEdgeTimes } = resolve(['a', 'b', 'c'])
    expect(pathNodes?.map((n) => n.name)).toEqual(['A', 'B', 'C'])
    expect(pathEdgeTimes).toHaveLength(2)
    expect(pathEdgeTimes?.[0]).toBeCloseTo(1, 10)
    expect(pathEdgeTimes?.[1]).toBeCloseTo(0.5, 10)
  })

  it('returns nulls for paths shorter than two nodes', () => {
    const resolve = createPathResolver(NODES, EDGES)
    expect(resolve(['a'])).toEqual({ pathNodes: null, pathEdgeTimes: null })
    expect(resolve([])).toEqual({ pathNodes: null, pathEdgeTimes: null })
  })

  it('returns nulls when a node cannot be resolved', () => {
    const resolve = createPathResolver(NODES, EDGES)
    expect(resolve(['a', 'ghost'])).toEqual({ pathNodes: null, pathEdgeTimes: null })
  })

  it('returns null edge times when no reference migration time exists', () => {
    const resolve = createPathResolver(
      NODES,
      EDGES.map(({ migrationTimeMonths: _, ...edge }) => edge)
    )
    const { pathNodes, pathEdgeTimes } = resolve(['a', 'b'])
    expect(pathNodes).not.toBeNull()
    expect(pathEdgeTimes).toBeNull()
  })

  it('returns null edge times when the path uses a non-existent edge', () => {
    const resolve = createPathResolver(NODES, EDGES)
    const { pathNodes, pathEdgeTimes } = resolve(['a', 'c'])
    expect(pathNodes).not.toBeNull()
    expect(pathEdgeTimes).toBeNull()
  })
})

describe('resolveCandidatePaths', () => {
  it('preserves candidate order and joins ids with arrows', () => {
    const resolved = resolveCandidatePaths(NODES, EDGES, [
      ['a', 'b', 'c'],
      ['a', 'b']
    ])

    expect(resolved.map((p) => p.id)).toEqual(['a→b→c', 'a→b'])
  })

  it('drops candidates whose nodes cannot be resolved', () => {
    const resolved = resolveCandidatePaths(NODES, EDGES, [
      ['a', 'ghost'],
      ['a', 'b']
    ])

    expect(resolved.map((p) => p.id)).toEqual(['a→b'])
  })
})
