import { describe, expect, it } from 'vitest'
import type { GraphEdge, GraphNode } from '../../lib/migration/types'
import { computeDegreeBasedLayout, isEdgeHighlighted, isNodeHighlighted, NODE_GAP, NODE_WIDTH } from './graph-layout'

function node(id: string): GraphNode {
  return { id, name: id.toUpperCase(), supportCost: 0, hostingCost: 0 }
}

const NODES = [node('a'), node('b'), node('c'), node('d')]
const EDGES: GraphEdge[] = [
  { from: 'a', to: 'b', effort: 1 },
  { from: 'a', to: 'c', effort: 1 },
  { from: 'b', to: 'd', effort: 1 },
  { from: 'c', to: 'd', effort: 1 }
]

describe('computeDegreeBasedLayout', () => {
  it('returns default dimensions for an empty graph', () => {
    expect(computeDegreeBasedLayout([], [])).toEqual({ positions: [], width: 600, height: 300 })
  })

  it('centers a single node', () => {
    const { positions } = computeDegreeBasedLayout([node('a')], [])
    expect(positions).toEqual([{ id: 'a', name: 'A', x: 300, y: 150 }])
  })

  it('orders layers source → middle → sink by degree score', () => {
    const { positions } = computeDegreeBasedLayout(NODES, EDGES)
    const byId = new Map(positions.map((p) => [p.id, p]))

    const a = byId.get('a')
    const b = byId.get('b')
    const c = byId.get('c')
    const d = byId.get('d')

    // a: out 2 / in 0 → source (leftmost); b, c balanced → middle; d: in 2 → sink
    expect(a && b && a.x < b.x).toBe(true)
    expect(b && d && b.x < d.x).toBe(true)
    expect(b && c && b.x === c.x).toBe(true)
  })

  it('is deterministic for the same input', () => {
    const first = computeDegreeBasedLayout(NODES, EDGES)
    const second = computeDegreeBasedLayout(NODES, EDGES)
    expect(first).toEqual(second)
  })

  it('does not overlap nodes within a layer', () => {
    const { positions } = computeDegreeBasedLayout(NODES, EDGES)
    const middle = positions.filter((p) => p.id === 'b' || p.id === 'c')

    expect(Math.abs((middle[0]?.y ?? 0) - (middle[1]?.y ?? 0))).toBeGreaterThanOrEqual(NODE_GAP)
  })

  it('grows the canvas with the layer count', () => {
    const { width } = computeDegreeBasedLayout(NODES, EDGES)
    expect(width).toBeGreaterThanOrEqual(600)
    expect(width).toBeGreaterThan(NODE_WIDTH * 3)
  })

  it('handles cycles without crashing (both nodes balanced)', () => {
    const cyclic: GraphEdge[] = [
      { from: 'a', to: 'b', effort: 1 },
      { from: 'b', to: 'a', effort: 1 }
    ]
    const { positions } = computeDegreeBasedLayout([node('a'), node('b')], cyclic)
    expect(positions).toHaveLength(2)
  })
})

describe('highlight predicates', () => {
  const path = ['a', 'b', 'd']

  it('isEdgeHighlighted matches only consecutive path pairs in direction', () => {
    expect(isEdgeHighlighted({ from: 'a', to: 'b', effort: 1 }, path)).toBe(true)
    expect(isEdgeHighlighted({ from: 'b', to: 'a', effort: 1 }, path)).toBe(false)
    expect(isEdgeHighlighted({ from: 'a', to: 'd', effort: 1 }, path)).toBe(false)
    expect(isEdgeHighlighted({ from: 'a', to: 'b', effort: 1 }, null)).toBe(false)
    expect(isEdgeHighlighted({ from: 'a', to: 'b', effort: 1 }, ['a'])).toBe(false)
  })

  it('isNodeHighlighted matches nodes on the path', () => {
    expect(isNodeHighlighted('b', path)).toBe(true)
    expect(isNodeHighlighted('c', path)).toBe(false)
    expect(isNodeHighlighted('a', null)).toBe(false)
  })
})
