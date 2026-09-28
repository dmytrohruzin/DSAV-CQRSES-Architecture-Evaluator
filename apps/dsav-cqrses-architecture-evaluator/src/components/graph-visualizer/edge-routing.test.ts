import { describe, expect, it } from 'vitest'
import type { GraphEdge } from '../../lib/migration/types'
import {
  computeDistributedPorts,
  computeEdgePath,
  computeEdgePathWithPorts,
  findIntermediateNodes,
  hasReverseEdge,
  LABEL_CLEARANCE,
  lineBlockedByNode,
  rectEdgeIntersection,
  resolveLabelOverlaps
} from './edge-routing'
import { NODE_HEIGHT, NODE_WIDTH, type NodePosition } from './graph-layout'

function pos(id: string, x: number, y: number): NodePosition {
  return { id, name: id.toUpperCase(), x, y }
}

describe('rectEdgeIntersection', () => {
  it('hits the right side for a horizontal target', () => {
    expect(rectEdgeIntersection(0, 0, 100, 0, 140, 40)).toEqual({ x: 70, y: 0 })
  })

  it('hits the bottom side for a vertical target', () => {
    expect(rectEdgeIntersection(0, 0, 0, 100, 140, 40)).toEqual({ x: 0, y: 20 })
  })

  it('returns the center when the target equals the center', () => {
    expect(rectEdgeIntersection(5, 5, 5, 5, 140, 40)).toEqual({ x: 5, y: 5 })
  })

  it('scales diagonal targets onto the border', () => {
    const { x, y } = rectEdgeIntersection(0, 0, 200, 200, 140, 40)
    expect(y).toBe(20)
    expect(x).toBe(20)
  })
})

describe('lineBlockedByNode', () => {
  it('detects a node sitting on the line between the endpoints', () => {
    expect(lineBlockedByNode(0, 0, 200, 0, pos('n', 100, 5), 30)).toBe(true)
  })

  it('ignores nodes beyond the clearance', () => {
    expect(lineBlockedByNode(0, 0, 200, 0, pos('n', 100, 50), 30)).toBe(false)
  })

  it('ignores nodes whose projection falls outside the segment', () => {
    expect(lineBlockedByNode(0, 0, 200, 0, pos('n', 300, 0), 30)).toBe(false)
  })

  it('returns false for a zero-length line', () => {
    expect(lineBlockedByNode(0, 0, 0, 0, pos('n', 0, 0), 30)).toBe(false)
  })
})

describe('findIntermediateNodes', () => {
  it('returns nodes strictly between the two X coordinates', () => {
    const from = pos('a', 0, 0)
    const to = pos('c', 400, 0)
    const between = pos('b', 200, 100)
    const outside = pos('d', 500, 0)

    expect(findIntermediateNodes(from, to, [from, to, between, outside])).toEqual([between])
  })
})

describe('computeEdgePath', () => {
  it('routes a straight line between adjacent layers', () => {
    const from = pos('a', 0, 0)
    const to = pos('b', 320, 0)
    const { path, midX, angle } = computeEdgePath(from, to, false, [from, to])

    expect(path).toMatch(/^M .* L .*$/)
    expect(midX).toBeGreaterThan(NODE_WIDTH / 2)
    expect(angle).toBeCloseTo(0, 10)
  })

  it('routes same-layer edges vertically from the node border', () => {
    const from = pos('a', 0, 0)
    const to = pos('b', 0, 160)
    const { path, angle } = computeEdgePath(from, to, false, [from, to])

    expect(path).toContain(`M 0 ${NODE_HEIGHT / 2}`)
    expect(angle).toBeCloseTo(Math.PI / 2, 10)
  })

  it('curves around a blocking intermediate node with a quadratic Bezier', () => {
    const from = pos('a', 0, 0)
    const to = pos('c', 640, 0)
    const blocker = pos('b', 320, 0)
    const { path } = computeEdgePath(from, to, false, [from, to, blocker])

    expect(path).toContain('Q')
  })

  it('offsets bidirectional edges perpendicular to the line', () => {
    const from = pos('a', 0, 0)
    const to = pos('b', 320, 0)
    const plain = computeEdgePath(from, to, false, [from, to])
    const bidir = computeEdgePath(from, to, true, [from, to])

    expect(bidir.midY).not.toBe(plain.midY)
  })
})

describe('hasReverseEdge', () => {
  const edges: GraphEdge[] = [
    { from: 'a', to: 'b', effort: 1 },
    { from: 'b', to: 'a', effort: 2 },
    { from: 'b', to: 'c', effort: 1 }
  ]

  it('detects reverse counterparts', () => {
    expect(hasReverseEdge({ from: 'a', to: 'b', effort: 1 }, edges)).toBe(true)
    expect(hasReverseEdge({ from: 'b', to: 'c', effort: 1 }, edges)).toBe(false)
  })
})

describe('computeDistributedPorts', () => {
  it('distributes multiple connections on the same node side', () => {
    const positions = new Map<string, NodePosition>([
      ['a', pos('a', 0, 0)],
      ['b', pos('b', 0, 160)],
      ['c', pos('c', 320, 80)]
    ])
    const edges: GraphEdge[] = [
      { from: 'a', to: 'c', effort: 1 },
      { from: 'b', to: 'c', effort: 1 }
    ]

    const ports = computeDistributedPorts(edges, positions)
    const first = ports.get('a:c')
    const second = ports.get('b:c')

    expect(first).toBeDefined()
    expect(second).toBeDefined()
    // Both enter the left border of c, at distinct heights ordered by source Y.
    expect(first?.endX).toBe(320 - NODE_WIDTH / 2)
    expect(second?.endX).toBe(320 - NODE_WIDTH / 2)
    expect(first?.endY).toBeLessThan(second?.endY ?? Number.NEGATIVE_INFINITY)
  })

  it('skips same-layer edges and edges with unknown nodes', () => {
    const positions = new Map<string, NodePosition>([
      ['a', pos('a', 0, 0)],
      ['b', pos('b', 0, 160)]
    ])
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', effort: 1 },
      { from: 'a', to: 'ghost', effort: 1 }
    ]

    expect(computeDistributedPorts(edges, positions).size).toBe(0)
  })
})

describe('computeEdgePathWithPorts', () => {
  it('uses the distributed port endpoints when available', () => {
    const from = pos('a', 0, 0)
    const to = pos('b', 320, 0)
    const port = { startX: NODE_WIDTH / 2, startY: -6, endX: 320 - NODE_WIDTH / 2, endY: 6 }

    const { path } = computeEdgePathWithPorts(from, to, false, [from, to], port)
    expect(path).toContain(`M ${NODE_WIDTH / 2} -6`)
  })

  it('falls back to center-based routing without a port', () => {
    const from = pos('a', 0, 0)
    const to = pos('b', 320, 0)

    const withPorts = computeEdgePathWithPorts(from, to, false, [from, to], undefined)
    const plain = computeEdgePath(from, to, false, [from, to])
    expect(withPorts).toEqual(plain)
  })
})

describe('resolveLabelOverlaps', () => {
  it('pushes labels apart when they are closer than the clearance', () => {
    const labels = [
      { midX: 100, midY: 100, angle: 0 },
      { midX: 105, midY: 100, angle: 0 }
    ]

    resolveLabelOverlaps(labels)

    const dy = Math.abs((labels[0]?.midY ?? 0) - (labels[1]?.midY ?? 0))
    expect(dy).toBeGreaterThanOrEqual(LABEL_CLEARANCE)
  })

  it('leaves distant labels untouched', () => {
    const labels = [
      { midX: 0, midY: 0, angle: 0 },
      { midX: 200, midY: 200, angle: 0 }
    ]

    resolveLabelOverlaps(labels)

    expect(labels[0]).toEqual({ midX: 0, midY: 0, angle: 0 })
    expect(labels[1]).toEqual({ midX: 200, midY: 200, angle: 0 })
  })
})
