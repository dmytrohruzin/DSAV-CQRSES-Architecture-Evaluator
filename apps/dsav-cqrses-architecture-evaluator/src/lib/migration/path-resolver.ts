// =============================================================================
// Migration Path Resolution
// =============================================================================
// Resolves pathfinder output (lists of node IDs) into GraphNode objects plus
// per-edge migration times derived from the graph's reference edge.

import { computeEdgeMigrationTimes } from './migration-timing'
import type { GraphEdge, GraphNode, ResolvedMigrationPath } from './types'

/** Result of resolving a single candidate path. */
export interface ResolvedPath {
  pathNodes: GraphNode[] | null
  pathEdgeTimes: number[] | null
}

/**
 * Build a resolver that maps a path of node IDs into GraphNode objects +
 * per-edge migration times derived from the global reference edge. The
 * resolver returns null parts when timing data is missing or any node in the
 * path can't be resolved.
 */
export function createPathResolver(nodes: GraphNode[], edges: GraphEdge[]): (ids: string[]) => ResolvedPath {
  const nodeById = new Map(nodes.map((n) => [n.id, n] as const))
  const globalTimes = computeEdgeMigrationTimes(edges)
  const timesByKey = new Map<string, number>()
  if (globalTimes !== null) {
    edges.forEach((e, i) => {
      timesByKey.set(`${e.from}|${e.to}`, globalTimes[i] ?? 0)
    })
  }

  return (ids: string[]): ResolvedPath => {
    if (ids.length < 2) return { pathNodes: null, pathEdgeTimes: null }
    const pathNodes: GraphNode[] = []
    for (const id of ids) {
      const node = nodeById.get(id)
      if (!node) return { pathNodes: null, pathEdgeTimes: null }
      pathNodes.push(node)
    }
    if (globalTimes === null) return { pathNodes, pathEdgeTimes: null }
    const pathEdgeTimes: number[] = []
    for (let i = 0; i < ids.length - 1; i++) {
      const t = timesByKey.get(`${ids[i]}|${ids[i + 1]}`)
      if (t === undefined) return { pathNodes, pathEdgeTimes: null }
      pathEdgeTimes.push(t)
    }
    return { pathNodes, pathEdgeTimes }
  }
}

/**
 * Resolve a list of candidate paths (each a list of node IDs) into
 * `ResolvedMigrationPath` entries, dropping candidates whose nodes can't be
 * resolved. Order is preserved (recommended candidate first).
 */
export function resolveCandidatePaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  candidates: string[][]
): ResolvedMigrationPath[] {
  const resolve = createPathResolver(nodes, edges)
  return candidates
    .map((ids) => {
      const { pathNodes, pathEdgeTimes } = resolve(ids)
      if (pathNodes === null) return null
      return { id: ids.join('→'), pathNodes, pathEdgeTimes }
    })
    .filter((v): v is ResolvedMigrationPath => v !== null)
}
