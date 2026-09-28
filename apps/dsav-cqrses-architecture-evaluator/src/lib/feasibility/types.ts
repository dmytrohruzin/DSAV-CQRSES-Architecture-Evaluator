// =============================================================================
// Migration Feasibility — Type Definitions
// =============================================================================

import type { GraphNode, PaybackBreakdown } from '../migration/types'

/**
 * One migration path from source to target, with resolved nodes and per-edge
 * timings. Structurally identical to `ResolvedMigrationPath` — feasibility
 * consumes paths produced by the migration domain.
 */
export interface FeasibilityPath {
  id: string
  pathNodes: GraphNode[]
  pathEdgeTimes: number[] | null
}

/**
 * Inputs for the migration feasibility assessment. Operational fields for
 * "Now" (source) and "After migration" (target) are read from `GraphNode`s
 * directly; the only user-editable inputs are the alternative
 * "Hardware upgrade" scenario and the one-time migration cost.
 */
export interface FeasibilityInputs {
  source: GraphNode | null
  target: GraphNode | null
  /** Ordered nodes along the migration path (length ≥ 2 when present). */
  path: GraphNode[] | null
  /**
   * Per-edge migration time (months) for the chosen path, in traversal order.
   * Length must equal `path.length - 1`. `null` means the timing data was not
   * derivable from the graph; the simulation falls back to the instantaneous
   * model.
   */
  pathEdgeTimes: number[] | null
  /** Alternative "hardware upgrade" scenario (kept user-editable). */
  hardwareUpgrade: { support: number; hosting: number }
  /** One-time migration cost (USD). */
  migrationCost: number
}

/** Result of the migration feasibility assessment. */
export interface FeasibilityResult {
  /** Monthly total in the current state (source.support + source.hosting). */
  monthlyNowTotal: number
  /** Monthly total after the hardware upgrade scenario. */
  monthlyUpgradeTotal: number
  /** Monthly total after migration (target.support + target.hosting). */
  monthlyMigrationTotal: number
  /** Savings per month vs the upgrade scenario (upgradeTotal − migrationTotal). */
  monthlySavings: number
  /** Months to recoup `migrationCost`, or null when migration doesn't pay off. */
  paybackMonths: number | null
  /** Total migration duration in months (sum of per-edge times), or null when timings are not derivable. */
  migrationDurationMonths: number | null
  /** True when timing data is missing and the simplistic instantaneous-migration formula was used. */
  usesFallback: boolean
  /** Step-by-step breakdown of cumulative costs. Null in the fallback model. */
  breakdown: PaybackBreakdown | null
}
