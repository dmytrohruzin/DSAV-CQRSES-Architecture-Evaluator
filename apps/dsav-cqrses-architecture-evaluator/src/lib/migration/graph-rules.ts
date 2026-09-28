// =============================================================================
// Migration Graph Rules
// =============================================================================
// Structural rules for editing the migration graph.

import type { ValidationError } from '../validation/types'
import { positiveNumber } from '../validation/validators'
import type { GraphEdge, GraphNode } from './types'

/** Check whether an edge with the same from→to already exists. */
export function hasDuplicateEdge(edges: GraphEdge[], from: string, to: string): boolean {
  return edges.some((e) => e.from === from && e.to === to)
}

/**
 * Validate the structural integrity of the migration graph: no duplicate
 * edges, no self-loops, positive efforts and known edge endpoints.
 */
export function validateGraph(nodes: GraphNode[], edges: GraphEdge[]): ValidationError[] {
  const errors: ValidationError[] = []
  const nodeIds = new Set(nodes.map((n) => n.id))

  edges.forEach((edge, index) => {
    const field = `edges[${index}]`

    if (edges.findIndex((other) => other.from === edge.from && other.to === edge.to) !== index) {
      errors.push({
        code: 'duplicate_edge',
        message: `Edge ${edge.from} → ${edge.to} is defined more than once`,
        field,
        context: { from: edge.from, to: edge.to }
      })
    }

    if (edge.from === edge.to) {
      errors.push({
        code: 'self_loop',
        message: `Edge ${edge.from} → ${edge.to} must connect two different variations`,
        field,
        context: { from: edge.from, to: edge.to }
      })
    }

    errors.push(...positiveNumber(edge.effort, `${field}.effort`))

    for (const endpoint of [edge.from, edge.to]) {
      if (!nodeIds.has(endpoint)) {
        errors.push({
          code: 'invalid_value',
          message: `Edge ${edge.from} → ${edge.to} references unknown variation "${endpoint}"`,
          field,
          context: { from: edge.from, to: edge.to, value: endpoint }
        })
      }
    }
  })

  return errors
}
