// -----------------------------------------------------------------------------
// Graph layout (presentation): deterministic node placement for the migration
// graph SVG plus highlight predicates. Pure functions — unit-testable without
// rendering.
// -----------------------------------------------------------------------------

import type { GraphEdge, GraphNode } from '../../lib/migration/types'

// -----------------------------------------------------------------------------
// Layout Constants
// -----------------------------------------------------------------------------

export const NODE_WIDTH = 140
export const NODE_HEIGHT = 40
export const NODE_GAP = 120
export const SVG_PADDING = 60
export const ARROWHEAD_SIZE = 8
export const EDGE_LABEL_OFFSET = 14

export interface NodePosition {
  id: string
  name: string
  x: number
  y: number
}

/**
 * Compute deterministic node positions using degree-based layering.
 *
 * Strategy:
 * - Score each node as (outDegree - inDegree). High score = source (left),
 *   low score = sink (right).
 * - Group nodes with the same score into layers.
 * - Sort layers left-to-right by descending score.
 * - Within each layer, spread nodes vertically with enough spacing.
 *
 * This approach handles cycles gracefully (both nodes in a cycle get a
 * middling score) and produces a deterministic, overlap-free layout.
 */
export function computeDegreeBasedLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { positions: NodePosition[]; width: number; height: number } {
  if (nodes.length === 0) return { positions: [], width: 600, height: 300 }

  if (nodes.length === 1) {
    const firstNode = nodes[0]
    if (!firstNode) return { positions: [], width: 600, height: 300 }
    return {
      positions: [{ id: firstNode.id, name: firstNode.name, x: 300, y: 150 }],
      width: 600,
      height: 300
    }
  }

  // --- Compute degree scores -----------------------------------------------
  const outDegree = new Map<string, number>()
  const inDegree = new Map<string, number>()

  for (const node of nodes) {
    outDegree.set(node.id, 0)
    inDegree.set(node.id, 0)
  }

  for (const edge of edges) {
    outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1)
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
  }

  // Categorize nodes into 3 groups:
  // - sources: more outgoing than incoming (leftmost)
  // - middle: balanced
  // - sinks: more incoming than outgoing, or only incoming (rightmost)
  const sources: GraphNode[] = []
  const middle: GraphNode[] = []
  const sinks: GraphNode[] = []

  for (const node of nodes) {
    const out = outDegree.get(node.id) ?? 0
    const inc = inDegree.get(node.id) ?? 0
    if (out > inc) {
      sources.push(node)
    } else if (out < inc) {
      sinks.push(node)
    } else {
      middle.push(node)
    }
  }

  // Build layers, skipping empty groups
  const layers: GraphNode[][] = []
  if (sources.length > 0) layers.push(sources)
  if (middle.length > 0) layers.push(middle)
  if (sinks.length > 0) layers.push(sinks)
  // If all in one group, just use that
  if (layers.length === 0) layers.push([...nodes])

  // --- Barycenter ordering within each layer (Sugiyama) --------------------
  // Process layers left-to-right. For each node in the current layer, compute
  // the average index of its connected nodes in the previous layer. Sort by
  // this barycenter value so that edges flow without unnecessary crossings.
  for (let layerIdx = 1; layerIdx < layers.length; layerIdx++) {
    const currentLayer = layers[layerIdx] as GraphNode[]
    const prevLayer = layers[layerIdx - 1] as GraphNode[]

    // Map nodeId -> vertical index in previous layer
    const prevIndexMap = new Map<string, number>()
    prevLayer.forEach((node, idx) => {
      prevIndexMap.set(node.id, idx)
    })

    // Compute barycenter for each node and sort
    currentLayer.sort((a, b) => {
      const aConnections = edges
        .filter((e) => (e.to === a.id && prevIndexMap.has(e.from)) || (e.from === a.id && prevIndexMap.has(e.to)))
        .map((e) => prevIndexMap.get(e.to === a.id ? e.from : e.to) ?? 0)
      const bConnections = edges
        .filter((e) => (e.to === b.id && prevIndexMap.has(e.from)) || (e.from === b.id && prevIndexMap.has(e.to)))
        .map((e) => prevIndexMap.get(e.to === b.id ? e.from : e.to) ?? 0)

      const aCenter = aConnections.length > 0 ? aConnections.reduce((s, v) => s + v, 0) / aConnections.length : Infinity
      const bCenter = bConnections.length > 0 ? bConnections.reduce((s, v) => s + v, 0) / bConnections.length : Infinity

      // Nodes with no connections to the previous layer get Infinity, so they
      // preserve their relative order at the bottom of the layer.
      return aCenter - bCenter
    })
  }

  // --- Compute dimensions --------------------------------------------------
  const layerCount = layers.length
  const maxNodesInLayer = Math.max(...layers.map((l) => l.length))
  const layerSpacing = NODE_WIDTH + NODE_GAP + 60 // horizontal space per layer
  const verticalSpacing = NODE_HEIGHT + NODE_GAP // vertical space per node

  const svgWidth = Math.max(600, SVG_PADDING * 2 + layerCount * layerSpacing)
  const svgHeight = Math.max(300, SVG_PADDING * 2 + maxNodesInLayer * verticalSpacing)

  // --- Place nodes deterministically ---------------------------------------
  const positions: NodePosition[] = []

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx] as GraphNode[]
    const x = SVG_PADDING + NODE_WIDTH / 2 + layerIdx * layerSpacing
    const totalLayerHeight = layer.length * verticalSpacing
    const startY = (svgHeight - totalLayerHeight) / 2 + verticalSpacing / 2

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      const node = layer[nodeIdx] as GraphNode
      const y = startY + nodeIdx * verticalSpacing
      positions.push({ id: node.id, name: node.name, x, y })
    }
  }

  return { positions, width: svgWidth, height: svgHeight }
}

/** Check whether a given edge is on the highlighted path */
export function isEdgeHighlighted(edge: GraphEdge, highlightedPath: string[] | null): boolean {
  if (!highlightedPath || highlightedPath.length < 2) return false
  for (let i = 0; i < highlightedPath.length - 1; i++) {
    if (highlightedPath[i] === edge.from && highlightedPath[i + 1] === edge.to) {
      return true
    }
  }
  return false
}

/** Check whether a given node is on the highlighted path */
export function isNodeHighlighted(nodeId: string, highlightedPath: string[] | null): boolean {
  if (!highlightedPath) return false
  return highlightedPath.includes(nodeId)
}
