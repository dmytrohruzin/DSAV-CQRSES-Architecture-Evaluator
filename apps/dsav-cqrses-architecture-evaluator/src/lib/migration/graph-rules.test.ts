import { describe, expect, it } from 'vitest'
import { hasDuplicateEdge, validateGraph } from './graph-rules'
import type { GraphEdge, GraphNode } from './types'

const EDGES: GraphEdge[] = [
  { from: 'a', to: 'b', effort: 1 },
  { from: 'b', to: 'c', effort: 2 }
]

const NODES: GraphNode[] = [
  { id: 'a', name: 'A', supportCost: 0, hostingCost: 0 },
  { id: 'b', name: 'B', supportCost: 0, hostingCost: 0 },
  { id: 'c', name: 'C', supportCost: 0, hostingCost: 0 }
]

describe('hasDuplicateEdge', () => {
  it('detects an existing from→to pair', () => {
    expect(hasDuplicateEdge(EDGES, 'a', 'b')).toBe(true)
  })

  it('treats the reverse direction as distinct', () => {
    expect(hasDuplicateEdge(EDGES, 'b', 'a')).toBe(false)
  })

  it('returns false for unknown pairs and empty lists', () => {
    expect(hasDuplicateEdge(EDGES, 'a', 'c')).toBe(false)
    expect(hasDuplicateEdge([], 'a', 'b')).toBe(false)
  })
})

describe('validateGraph', () => {
  it('accepts a structurally valid graph', () => {
    expect(validateGraph(NODES, EDGES)).toEqual([])
  })

  it('reports duplicate edges (second occurrence only)', () => {
    const errors = validateGraph(NODES, [...EDGES, { from: 'a', to: 'b', effort: 3 }])
    expect(errors.map((e) => e.code)).toEqual(['duplicate_edge'])
  })

  it('reports self-loops', () => {
    const errors = validateGraph(NODES, [{ from: 'a', to: 'a', effort: 1 }])
    expect(errors.map((e) => e.code)).toContain('self_loop')
  })

  it('reports non-positive efforts', () => {
    const errors = validateGraph(NODES, [{ from: 'a', to: 'b', effort: 0 }])
    expect(errors.map((e) => e.code)).toContain('not_positive')
  })

  it('reports unknown edge endpoints', () => {
    const errors = validateGraph(NODES, [{ from: 'a', to: 'ghost', effort: 1 }])
    expect(errors.map((e) => e.code)).toContain('invalid_value')
  })
})
