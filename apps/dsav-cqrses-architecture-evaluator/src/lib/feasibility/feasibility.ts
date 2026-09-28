// =============================================================================
// Migration Feasibility Assessment
// =============================================================================
// Compares the monthly cost of upgrading the current hardware against the
// monthly cost of running the target variation after migration. When the
// caller supplies per-edge migration times (or a single reference time so
// migration-timing can derive the rest), this delegates to a step-by-step
// payback simulation. Otherwise it falls back to the simplistic
// migration-is-instantaneous formula.

import { simulatePaybackBreakdown } from '../migration/migration-timing'
import type { GraphNode } from '../migration/types'
import type { FeasibilityInputs, FeasibilityResult } from './types'

/** Canonical defaults — yield payback ≈ 5.56 months in the fallback model. */
export const DEFAULT_HARDWARE_UPGRADE = { support: 50, hosting: 200 }
export const DEFAULT_MIGRATION_COST = 500

export function calculateFeasibility(args: FeasibilityInputs): FeasibilityResult {
  const { source, target, path, pathEdgeTimes, hardwareUpgrade, migrationCost } = args

  const monthlyNowTotal = source ? source.supportCost + source.hostingCost : 0
  const monthlyUpgradeTotal = hardwareUpgrade.support + hardwareUpgrade.hosting
  const monthlyMigrationTotal = target ? target.supportCost + target.hostingCost : 0
  const monthlySavings = monthlyUpgradeTotal - monthlyMigrationTotal

  const allHardwareUpgradeFinite = Number.isFinite(hardwareUpgrade.support) && Number.isFinite(hardwareUpgrade.hosting)
  const migrationCostFinite = Number.isFinite(migrationCost) && migrationCost >= 0

  // Try the timing-aware simulation first.
  if (
    path &&
    path.length >= 2 &&
    pathEdgeTimes !== null &&
    pathEdgeTimes.length === path.length - 1 &&
    allHardwareUpgradeFinite &&
    migrationCostFinite &&
    allNodesValid(path)
  ) {
    const migrationDurationMonths = sum(pathEdgeTimes)
    const breakdown = simulatePaybackBreakdown({
      path,
      edgeTimes: pathEdgeTimes,
      migrationCost,
      monthlyUpgradeCost: monthlyUpgradeTotal
    })
    return {
      monthlyNowTotal,
      monthlyUpgradeTotal,
      monthlyMigrationTotal,
      monthlySavings,
      paybackMonths: breakdown?.paybackMonths ?? null,
      migrationDurationMonths,
      usesFallback: false,
      breakdown: breakdown ?? null
    }
  }

  // Fallback: assume migration is instantaneous.
  let paybackMonths: number | null = null
  if (migrationCostFinite && allHardwareUpgradeFinite && monthlySavings > 0) {
    paybackMonths = migrationCost / monthlySavings
  }

  return {
    monthlyNowTotal,
    monthlyUpgradeTotal,
    monthlyMigrationTotal,
    monthlySavings,
    paybackMonths,
    migrationDurationMonths: null,
    usesFallback: true,
    breakdown: null
  }
}

/** Helper: every node has finite, non-negative support and hosting costs. */
function allNodesValid(nodes: GraphNode[]): boolean {
  return nodes.every(
    (n) => Number.isFinite(n.supportCost) && n.supportCost >= 0 && Number.isFinite(n.hostingCost) && n.hostingCost >= 0
  )
}

function sum(values: number[]): number {
  let total = 0
  for (const v of values) total += v
  return total
}
