// =============================================================================
// Migration Roadmap — Type Definitions
// =============================================================================
// Graph structure, pathfinding results and the payback simulation types owned
// by `migration-timing`.

/** A node in the migration graph (an architectural variation) with monthly operational costs. */
export interface GraphNode {
  id: string
  name: string
  /** Cost of supporting the system on this variation (USD/month). */
  supportCost: number
  /** Cost of hosting the system on this variation (USD/month). */
  hostingCost: number
}

/**
 * A directed edge in the migration graph.
 *
 * `effort` is unitless and is used both for pathfinding and to derive the
 * migration time of other edges. `migrationTimeMonths` is optional: when set
 * on at least one edge, the helper `computeEdgeMigrationTimes` uses it as the
 * reference for proportional scaling across the rest of the edges.
 */
export interface GraphEdge {
  from: string
  to: string
  effort: number
  migrationTimeMonths?: number
}

/** A single step in a migration path */
export interface PathStep {
  from: string
  to: string
  effort: number
}

/** Result of pathfinding: optimal path and alternatives */
export interface PathResult {
  path: string[]
  totalEffort: number
  steps: PathStep[]
  alternatives: PathResult[]
}

/**
 * A viable migration path resolved into GraphNode objects plus per-edge
 * migration times, so a payback simulation can run per path.
 */
export interface ResolvedMigrationPath {
  id: string
  pathNodes: GraphNode[]
  pathEdgeTimes: number[] | null
}

/**
 * One row in the step-by-step payback breakdown. A breakdown lists every
 * segment along the migration timeline plus the post-migration tail, so the
 * user can see how cumulative migration and upgrade costs evolve and which
 * segment the curves cross in.
 */
export interface PaybackSegment {
  /** Human-meaningful key: 'initial' | 'edge' | 'target'. */
  kind: 'initial' | 'edge' | 'target'
  /** From-node name (for 'edge'); target-node name (for 'target'); empty for 'initial'. */
  fromName: string
  /** To-node name (for 'edge'); empty for 'initial' and 'target'. */
  toName: string
  /** Cumulative time at the start of this segment (months). */
  startMonth: number
  /**
   * Cumulative time at the end of this segment (months). For 'target', this is
   * the moment payback is reached — or null when migration is never cheaper.
   */
  endMonth: number | null
  /** Cumulative migration cost at the end of this segment. */
  cumMigration: number
  /** Cumulative upgrade-scenario cost at the end of this segment. */
  cumUpgrade: number
  /** True when the payback crossover falls inside this segment. */
  paybackReached: boolean
}

/** Step-by-step result with all segments and the payback month, if any. */
export interface PaybackBreakdown {
  segments: PaybackSegment[]
  paybackMonths: number | null
}
