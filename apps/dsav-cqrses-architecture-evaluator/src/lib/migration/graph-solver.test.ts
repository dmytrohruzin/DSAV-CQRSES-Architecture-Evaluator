import { describe, expect, it } from 'vitest'
import { findAllPaths, findShortestPath } from './graph-solver'
import type { GraphEdge, GraphNode } from './types'

// ---------------------------------------------------------------------------
// Helpers — node / edge factories
// ---------------------------------------------------------------------------

function makeNode(id: string, supportCost = 0, hostingCost = 0): GraphNode {
  return { id, name: id, supportCost, hostingCost }
}

function makeEdge(from: string, to: string, effort: number): GraphEdge {
  return { from, to, effort }
}

// ---------------------------------------------------------------------------
// 1. Direct path — 2 nodes, 1 edge
// ---------------------------------------------------------------------------

describe('findShortestPath', () => {
  describe('direct path', () => {
    it('should return a single-step path when there is one direct edge', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B')]
      const edges = [makeEdge('A', 'B', 10)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'B')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['A', 'B'])
      expect(result?.totalEffort).toBe(10)
      expect(result?.steps).toEqual([{ from: 'A', to: 'B', effort: 10 }])
    })
  })

  // ---------------------------------------------------------------------------
  // 2. Multi-hop shortest path — Dijkstra finds the optimal route
  // ---------------------------------------------------------------------------

  describe('multi-hop shortest path', () => {
    it('should find the shortest path through intermediate nodes', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
      const edges = [makeEdge('A', 'B', 3), makeEdge('B', 'C', 4), makeEdge('A', 'C', 20)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'C')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['A', 'B', 'C'])
      expect(result?.totalEffort).toBe(7)
      expect(result?.steps).toHaveLength(2)
    })

    it('should prefer the lower-effort multi-hop route over a direct expensive one', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B'), makeNode('C'), makeNode('D')]
      const edges = [makeEdge('A', 'D', 100), makeEdge('A', 'B', 10), makeEdge('B', 'C', 10), makeEdge('C', 'D', 10)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'D')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['A', 'B', 'C', 'D'])
      expect(result?.totalEffort).toBe(30)
    })
  })

  // ---------------------------------------------------------------------------
  // 4. Unreachable target — no path exists
  // ---------------------------------------------------------------------------

  describe('unreachable target', () => {
    it('should return null when no path exists to the target', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
      const edges = [makeEdge('A', 'B', 5)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'C')

      // Assert
      expect(result).toBeNull()
    })

    it('should return null when the source node does not exist', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B')]
      const edges = [makeEdge('A', 'B', 5)]

      // Act
      const result = findShortestPath(nodes, edges, 'Z', 'B')

      // Assert
      expect(result).toBeNull()
    })

    it('should return null when the target node does not exist', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B')]
      const edges = [makeEdge('A', 'B', 5)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'Z')

      // Assert
      expect(result).toBeNull()
    })

    it('should return null when edges array is empty', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B')]
      const edges: GraphEdge[] = []

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'B')

      // Assert
      expect(result).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // 5. Single node graph — source == target
  // ---------------------------------------------------------------------------

  describe('single node graph (source equals target)', () => {
    it('should return a path with 0 effort and no steps when source equals target', () => {
      // Arrange
      const nodes = [makeNode('A')]
      const edges: GraphEdge[] = []

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'A')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['A'])
      expect(result?.totalEffort).toBe(0)
      expect(result?.steps).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // 6. Cyclic graph — does not loop infinitely
  // ---------------------------------------------------------------------------

  describe('cyclic graph', () => {
    it('should find the shortest path without looping through cycles', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
      const edges = [
        makeEdge('A', 'B', 5),
        makeEdge('B', 'C', 5),
        makeEdge('C', 'A', 5) // cycle back to A
      ]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'C')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['A', 'B', 'C'])
      expect(result?.totalEffort).toBe(10)
    })
  })

  // ---------------------------------------------------------------------------
  // 7. Equal weight paths
  // ---------------------------------------------------------------------------

  describe('equal weight paths', () => {
    it('should return one shortest path and include others as alternatives', () => {
      // Arrange
      const nodes = [makeNode('A'), makeNode('B'), makeNode('C'), makeNode('D')]
      const edges = [makeEdge('A', 'B', 5), makeEdge('B', 'D', 5), makeEdge('A', 'C', 5), makeEdge('C', 'D', 5)]

      // Act
      const result = findShortestPath(nodes, edges, 'A', 'D')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.totalEffort).toBe(10)
      expect(result?.alternatives).toHaveLength(1)
      expect(result?.alternatives[0]?.totalEffort).toBe(10)
    })
  })

  // ---------------------------------------------------------------------------
  // 8. Default data — Classical CQRS <-> mCQRS transition efforts
  // ---------------------------------------------------------------------------

  describe('default data transitions', () => {
    it('should compute effort 15.0 for Classical CQRS to mCQRS', () => {
      // Arrange
      const nodes = [makeNode('Classical CQRS'), makeNode('mCQRS')]
      const edges = [makeEdge('Classical CQRS', 'mCQRS', 15.0)]

      // Act
      const result = findShortestPath(nodes, edges, 'Classical CQRS', 'mCQRS')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['Classical CQRS', 'mCQRS'])
      expect(result?.totalEffort).toBe(15.0)
      expect(result?.steps).toEqual([{ from: 'Classical CQRS', to: 'mCQRS', effort: 15.0 }])
    })

    it('should compute effort 22.5 for mCQRS to Classical CQRS', () => {
      // Arrange
      const nodes = [makeNode('Classical CQRS'), makeNode('mCQRS')]
      const edges = [makeEdge('mCQRS', 'Classical CQRS', 22.5)]

      // Act
      const result = findShortestPath(nodes, edges, 'mCQRS', 'Classical CQRS')

      // Assert
      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['mCQRS', 'Classical CQRS'])
      expect(result?.totalEffort).toBe(22.5)
      expect(result?.steps).toEqual([{ from: 'mCQRS', to: 'Classical CQRS', effort: 22.5 }])
    })
  })
})

// ---------------------------------------------------------------------------
// 3. Multiple alternative paths — findAllPaths
// ---------------------------------------------------------------------------

describe('findAllPaths', () => {
  it('should return all paths sorted by effort ascending', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B'), makeNode('C'), makeNode('D')]
    const edges = [
      makeEdge('A', 'B', 1),
      makeEdge('B', 'D', 1),
      makeEdge('A', 'C', 5),
      makeEdge('C', 'D', 5),
      makeEdge('A', 'D', 50)
    ]

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'D')

    // Assert
    expect(results.length).toBeGreaterThanOrEqual(3)
    // Sorted ascending by effort
    for (let i = 1; i < results.length; i++) {
      expect(results[i]?.totalEffort).toBeGreaterThanOrEqual(results[i - 1]?.totalEffort ?? 0)
    }
    // First is shortest
    expect(results[0]?.totalEffort).toBe(2)
  })

  it('should return an empty array when the target is unreachable', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
    const edges = [makeEdge('A', 'B', 5)]

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'C')

    // Assert
    expect(results).toEqual([])
  })

  it('should return a single path with 0 effort when source equals target', () => {
    // Arrange
    const nodes = [makeNode('A')]
    const edges: GraphEdge[] = []

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'A')

    // Assert
    expect(results).toHaveLength(1)
    expect(results[0]?.path).toEqual(['A'])
    expect(results[0]?.totalEffort).toBe(0)
    expect(results[0]?.steps).toEqual([])
  })

  it('should return an empty array when the source node does not exist', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B')]
    const edges = [makeEdge('A', 'B', 5)]

    // Act
    const results = findAllPaths(nodes, edges, 'Z', 'B')

    // Assert
    expect(results).toEqual([])
  })

  it('should return an empty array when edges are empty', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B')]
    const edges: GraphEdge[] = []

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'B')

    // Assert
    expect(results).toEqual([])
  })

  it('should handle cyclic graphs without infinite loops', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
    const edges = [
      makeEdge('A', 'B', 3),
      makeEdge('B', 'C', 4),
      makeEdge('C', 'A', 2) // cycle
    ]

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'C')

    // Assert
    expect(results).toHaveLength(1)
    expect(results[0]?.path).toEqual(['A', 'B', 'C'])
    expect(results[0]?.totalEffort).toBe(7)
  })

  it('should include step details with correct from/to/effort for each path', () => {
    // Arrange
    const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
    const edges = [makeEdge('A', 'B', 8), makeEdge('B', 'C', 12)]

    // Act
    const results = findAllPaths(nodes, edges, 'A', 'C')

    // Assert
    expect(results).toHaveLength(1)
    expect(results[0]?.steps).toEqual([
      { from: 'A', to: 'B', effort: 8 },
      { from: 'B', to: 'C', effort: 12 }
    ])
    expect(results[0]?.totalEffort).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// Custom getWeight — override edge weight for Dijkstra
// ---------------------------------------------------------------------------

describe('findShortestPath with custom getWeight', () => {
  it('uses the supplied weight function instead of edge.effort', () => {
    // Direct A → C effort 1, but custom weight inflates it to 100.
    // A → B → C effort 2+2=4, custom weight stays 2+2=4.
    // → shortest by custom weight is the indirect path.
    const nodes = [makeNode('A'), makeNode('B'), makeNode('C')]
    const edges = [makeEdge('A', 'C', 1), makeEdge('A', 'B', 2), makeEdge('B', 'C', 2)]

    const result = findShortestPath(nodes, edges, 'A', 'C', (e) => (e.from === 'A' && e.to === 'C' ? 100 : e.effort))

    expect(result).not.toBeNull()
    expect(result?.path).toEqual(['A', 'B', 'C'])
    expect(result?.totalEffort).toBe(4)
  })
})
