// =============================================================================
// Default Migration Roadmap Graph
// =============================================================================
// Four architectural variations with per-node monthly operational costs
// (USD/month) and five directed migration edges. The Canonical CQRS →
// Classical CQRS edge carries a reference `migrationTimeMonths` so the
// migration times of the other edges scale proportionally by effort.

import type { GraphEdge, GraphNode } from '../lib/migration/types'

export const DEFAULT_MIGRATION_NODES: GraphNode[] = [
  { id: 'classical-cqrs', name: 'Classical CQRS', supportCost: 50, hostingCost: 100 },
  { id: 'mcqrs', name: 'mCQRS', supportCost: 40, hostingCost: 120 },
  { id: 'canonical-cqrs', name: 'Canonical CQRS', supportCost: 80, hostingCost: 120 },
  { id: 'mcqrs-plus', name: 'mCQRS+', supportCost: 40, hostingCost: 100 }
]

// Edge efforts are the total migration integration complexity per migration
// (sum over process classes × process counts), taken from the CF complexity
// migrations summary.
export const DEFAULT_MIGRATION_EDGES: GraphEdge[] = [
  { from: 'classical-cqrs', to: 'mcqrs', effort: 801.37 },
  { from: 'mcqrs', to: 'classical-cqrs', effort: 1014.95 },
  { from: 'canonical-cqrs', to: 'classical-cqrs', effort: 791.94, migrationTimeMonths: 1 },
  { from: 'canonical-cqrs', to: 'mcqrs', effort: 829.44 },
  { from: 'mcqrs', to: 'mcqrs-plus', effort: 564.46 }
]

export const DEFAULT_MIGRATION_SOURCE = 'canonical-cqrs'
export const DEFAULT_MIGRATION_TARGET = 'mcqrs-plus'
