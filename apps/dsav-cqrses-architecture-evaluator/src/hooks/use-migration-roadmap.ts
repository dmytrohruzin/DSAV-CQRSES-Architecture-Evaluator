'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  DEFAULT_MIGRATION_EDGES,
  DEFAULT_MIGRATION_NODES,
  DEFAULT_MIGRATION_SOURCE,
  DEFAULT_MIGRATION_TARGET
} from '../data/default-migration-graph'
import { findShortestPath } from '../lib/migration/graph-solver'
import { resolveCandidatePaths } from '../lib/migration/path-resolver'
import type { GraphEdge, GraphNode, PathResult, ResolvedMigrationPath } from '../lib/migration/types'

export type { ResolvedMigrationPath } from '../lib/migration/types'

/**
 * State, derived data, and handlers for the Migration Roadmap tab: graph
 * editing, source/target selection, shortest-path computation, and resolved
 * path data for feasibility assessment.
 */
export function useMigrationRoadmap() {
  const [nodes, setNodes] = useState<GraphNode[]>(() => [...DEFAULT_MIGRATION_NODES])
  const [edges, setEdges] = useState<GraphEdge[]>(() => [...DEFAULT_MIGRATION_EDGES])
  const [source, setSource] = useState<string>(DEFAULT_MIGRATION_SOURCE)
  const [target, setTarget] = useState<string>(DEFAULT_MIGRATION_TARGET)
  const [result, setResult] = useState<PathResult | null>(null)

  const highlightedPath = result !== null && result.path.length > 1 ? result.path : null

  const sourceNode = useMemo(() => nodes.find((n) => n.id === source) ?? null, [nodes, source])
  const targetNode = useMemo(() => nodes.find((n) => n.id === target) ?? null, [nodes, target])

  /**
   * All viable migration paths from source to target, recommended (optimal) one
   * first. Each entry carries resolved nodes and per-edge migration times so
   * FeasibilityAssessment can run a separate payback simulation per path.
   */
  const allPaths = useMemo((): ResolvedMigrationPath[] => {
    if (!result || result.path.length < 2) return []
    return resolveCandidatePaths(nodes, edges, [result.path, ...result.alternatives.map((a) => a.path)])
  }, [result, nodes, edges])

  const handleNodesChange = useCallback(
    (nextNodes: GraphNode[]) => {
      setNodes(nextNodes)
      setResult(null)
      const nodeIds = new Set(nextNodes.map((n) => n.id))
      if (!nodeIds.has(source)) setSource(nextNodes[0]?.id ?? '')
      if (!nodeIds.has(target)) setTarget(nextNodes[1]?.id ?? nextNodes[0]?.id ?? '')
    },
    [source, target]
  )

  const handleEdgesChange = useCallback((nextEdges: GraphEdge[]) => {
    setEdges(nextEdges)
    setResult(null)
  }, [])

  const handleSourceChange = useCallback((nodeId: string) => {
    setSource(nodeId)
    setResult(null)
  }, [])

  const handleTargetChange = useCallback((nodeId: string) => {
    setTarget(nodeId)
    setResult(null)
  }, [])

  const handleFindPath = useCallback(() => {
    if (!source || !target || source === target) return

    // Pathfinding uses the plain `effort` weight — operational costs and effort
    // are different dimensions and can't be summed for shortest-path purposes.
    // Cost-aware analysis happens later in FeasibilityAssessment.
    const pathResult = findShortestPath(nodes, edges, source, target)

    if (pathResult === null) {
      setResult({ path: [], totalEffort: 0, steps: [], alternatives: [] })
    } else {
      setResult(pathResult)
    }
  }, [nodes, edges, source, target])

  return {
    nodes,
    edges,
    source,
    target,
    result,
    highlightedPath,
    sourceNode,
    targetNode,
    allPaths,
    handleNodesChange,
    handleEdgesChange,
    handleSourceChange,
    handleTargetChange,
    handleFindPath
  }
}
