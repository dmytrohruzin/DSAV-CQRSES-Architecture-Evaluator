// =============================================================================
// Per-Path Migration Summary
// =============================================================================
// Builds the feasibility summary table: one row per viable migration path
// with its duration, user-supplied cost and payback month against the
// hardware-upgrade scenario.

import { simulatePayback } from '../migration/migration-timing'
import { isNonNegativeFinite } from '../validation/validators'
import type { FeasibilityPath } from './types'

/** One row of the per-path summary table. */
export interface PathSummaryRow {
  id: string
  label: string
  duration: number | null
  cost: number
  payback: number | null
}

/** Human-readable path label: node names joined with arrows. */
export function pathLabel(path: FeasibilityPath): string {
  return path.pathNodes.map((n) => n.name).join(' → ')
}

export interface SummarizeMigrationPathsArgs {
  paths: FeasibilityPath[]
  /** Per-path one-time migration cost overrides, keyed by path id. */
  migrationCosts: Record<string, number>
  /** Cost used when a path has no override. */
  defaultMigrationCost: number
  /** Monthly total of the hardware-upgrade scenario. */
  monthlyUpgradeCost: number
}

/**
 * Summarize every path with duration, cost and payback. Payback is only
 * simulated when the path has timing data, the cost is a finite number ≥ 0
 * and the upgrade scenario has a positive monthly total.
 */
export function summarizeMigrationPaths({
  paths,
  migrationCosts,
  defaultMigrationCost,
  monthlyUpgradeCost
}: SummarizeMigrationPathsArgs): PathSummaryRow[] {
  return paths.map((p) => {
    const cost = migrationCosts[p.id] ?? defaultMigrationCost
    const duration = p.pathEdgeTimes !== null ? p.pathEdgeTimes.reduce((a, b) => a + b, 0) : null
    const payback =
      p.pathEdgeTimes !== null && isNonNegativeFinite(cost) && monthlyUpgradeCost > 0
        ? simulatePayback({
            path: p.pathNodes,
            edgeTimes: p.pathEdgeTimes,
            migrationCost: cost,
            monthlyUpgradeCost
          })
        : null
    return { id: p.id, label: pathLabel(p), duration, cost, payback }
  })
}
