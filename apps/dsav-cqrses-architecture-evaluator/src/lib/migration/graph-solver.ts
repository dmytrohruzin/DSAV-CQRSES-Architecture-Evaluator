// =============================================================================
// Graph Solver — Dijkstra's algorithm & DFS all-paths for migration roadmap
// =============================================================================

import type { GraphEdge, GraphNode, PathResult, PathStep } from './types'

/**
 * Build an adjacency list from edges.
 * Maps each node id to its outgoing edges.
 */
function buildAdjacencyList(edges: GraphEdge[]): Map<string, GraphEdge[]> {
  const adj = new Map<string, GraphEdge[]>()
  for (const edge of edges) {
    const list = adj.get(edge.from)
    if (list) {
      list.push(edge)
    } else {
      adj.set(edge.from, [edge])
    }
  }
  return adj
}

/**
 * Reconstruct a PathResult from Dijkstra's predecessor map.
 */
function reconstructPath(
  prev: Map<string, string | null>,
  dist: Map<string, number>,
  edges: GraphEdge[],
  target: string
): PathResult {
  const path: string[] = []
  let current: string | null | undefined = target

  while (current != null) {
    path.unshift(current)
    current = prev.get(current) ?? null
  }

  const steps: PathStep[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i] as string
    const to = path[i + 1] as string
    const edge = edges.find((e) => e.from === from && e.to === to)
    steps.push({
      from,
      to,
      effort: edge?.effort ?? 0
    })
  }

  return {
    path,
    totalEffort: dist.get(target) ?? 0,
    steps,
    alternatives: []
  }
}

/**
 * Find the shortest path from source to target using Dijkstra's algorithm.
 *
 * Returns the optimal path with steps and total effort.
 * Returns null if the target is unreachable from the source.
 * Returns an empty path with 0 effort if source === target.
 *
 * `getWeight` overrides the edge weight used during relaxation. Defaults to
 * `edge.effort` to preserve existing behaviour.
 */
export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  source: string,
  target: string,
  getWeight: (edge: GraphEdge) => number = (e) => e.effort
): PathResult | null {
  // Source equals target — empty path with 0 effort
  if (source === target) {
    return {
      path: [source],
      totalEffort: 0,
      steps: [],
      alternatives: []
    }
  }

  const nodeIds = new Set(nodes.map((n) => n.id))

  // Validate that source and target exist in nodes
  if (!nodeIds.has(source) || !nodeIds.has(target)) {
    return null
  }

  // No edges — target is unreachable
  if (edges.length === 0) {
    return null
  }

  const adj = buildAdjacencyList(edges)

  // Dijkstra's algorithm using a simple priority extraction
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  for (const id of nodeIds) {
    dist.set(id, Number.POSITIVE_INFINITY)
    prev.set(id, null)
  }
  dist.set(source, 0)

  while (true) {
    // Find unvisited node with minimum distance
    let minDist = Number.POSITIVE_INFINITY
    let minNode: string | null = null

    for (const id of nodeIds) {
      if (!visited.has(id)) {
        const d = dist.get(id) ?? Number.POSITIVE_INFINITY
        if (d < minDist) {
          minDist = d
          minNode = id
        }
      }
    }

    // No more reachable unvisited nodes
    if (minNode === null || minDist === Number.POSITIVE_INFINITY) {
      break
    }

    // Found the target — we can stop early
    if (minNode === target) {
      break
    }

    visited.add(minNode)

    // Relax edges
    const outEdges = adj.get(minNode) ?? []
    for (const edge of outEdges) {
      if (visited.has(edge.to)) continue
      const newDist = minDist + getWeight(edge)
      const currentDist = dist.get(edge.to) ?? Number.POSITIVE_INFINITY
      if (newDist < currentDist) {
        dist.set(edge.to, newDist)
        prev.set(edge.to, minNode)
      }
    }
  }

  // Check if target is reachable
  const targetDist = dist.get(target) ?? Number.POSITIVE_INFINITY
  if (targetDist === Number.POSITIVE_INFINITY) {
    return null
  }

  const result = reconstructPath(prev, dist, edges, target)

  // Populate alternatives from findAllPaths (excluding the shortest)
  const allPaths = findAllPaths(nodes, edges, source, target, getWeight)
  result.alternatives = allPaths.filter((p) => p.path.join(',') !== result.path.join(','))

  return result
}

/**
 * Find all possible paths from source to target using DFS with cycle detection.
 *
 * Returns all paths sorted by total effort ascending.
 * The first element is the shortest path (same result as findShortestPath).
 * Returns an empty array if the target is unreachable.
 * Returns a single path with 0 effort if source === target.
 */
export function findAllPaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  source: string,
  target: string,
  getWeight: (edge: GraphEdge) => number = (e) => e.effort
): PathResult[] {
  // Source equals target — single empty path
  if (source === target) {
    return [
      {
        path: [source],
        totalEffort: 0,
        steps: [],
        alternatives: []
      }
    ]
  }

  const nodeIds = new Set(nodes.map((n) => n.id))

  // Validate that source and target exist
  if (!nodeIds.has(source) || !nodeIds.has(target)) {
    return []
  }

  // No edges — no paths possible
  if (edges.length === 0) {
    return []
  }

  const adj = buildAdjacencyList(edges)
  const results: PathResult[] = []

  // DFS with visited tracking for cycle detection
  function dfs(current: string, visited: Set<string>, path: string[], steps: PathStep[], totalEffort: number): void {
    if (current === target) {
      results.push({
        path: [...path],
        totalEffort,
        steps: [...steps],
        alternatives: []
      })
      return
    }

    const outEdges = adj.get(current) ?? []
    for (const edge of outEdges) {
      if (visited.has(edge.to)) continue

      visited.add(edge.to)
      path.push(edge.to)
      steps.push({ from: edge.from, to: edge.to, effort: edge.effort })

      dfs(edge.to, visited, path, steps, totalEffort + getWeight(edge))

      visited.delete(edge.to)
      path.pop()
      steps.pop()
    }
  }

  const visited = new Set<string>([source])
  dfs(source, visited, [source], [], 0)

  // Sort by total effort ascending
  results.sort((a, b) => a.totalEffort - b.totalEffort)

  return results
}
