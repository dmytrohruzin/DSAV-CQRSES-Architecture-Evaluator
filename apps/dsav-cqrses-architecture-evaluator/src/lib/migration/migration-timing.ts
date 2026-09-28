// =============================================================================
// Migration Timing & Cost-Aware Pathfinding Helpers
// =============================================================================
// Pure helpers used by Migration Roadmap to:
//  - derive per-edge migration time from a single reference edge,
//  - compute a "full" edge weight (effort + operational ops during the edge),
//  - run a step-by-step payback simulation along a path.

import type { GraphEdge, GraphNode, PaybackBreakdown, PaybackSegment } from './types'

/**
 * Derive the migration time (months) for every edge in `edges` by using the
 * first edge that has a positive `migrationTimeMonths` as the reference.
 * The remaining edges scale proportionally:
 *
 *   time(edge_i) = effort(edge_i) × (refTime / refEffort)
 *
 * Returns `null` when no edge has a valid reference time. When a reference is
 * present but some edge has a non-positive / non-finite effort, that edge's
 * derived time falls back to 0 (so the caller can still produce a number).
 */
export function computeEdgeMigrationTimes(edges: GraphEdge[]): number[] | null {
  if (edges.length === 0) return null

  let refEffort = 0
  let refTime = 0
  let found = false
  for (const edge of edges) {
    if (
      typeof edge.migrationTimeMonths === 'number' &&
      Number.isFinite(edge.migrationTimeMonths) &&
      edge.migrationTimeMonths > 0 &&
      Number.isFinite(edge.effort) &&
      edge.effort > 0
    ) {
      refEffort = edge.effort
      refTime = edge.migrationTimeMonths
      found = true
      break
    }
  }
  if (!found) return null

  const ratio = refTime / refEffort
  return edges.map((edge) => {
    if (!Number.isFinite(edge.effort) || edge.effort <= 0) return 0
    return edge.effort * ratio
  })
}

/**
 * Compute the "full" weight for one migration edge, taking into account both
 * the one-time effort and the operational cost on the source node during the
 * migration time:
 *
 *   weight = effort + (supportCost + hostingCost)(from) × migrationTime
 *
 * Returns `null` when the time can't be derived or the `from` node is missing.
 */
export function computeEdgeFullWeight(
  edge: GraphEdge,
  fromNode: GraphNode | undefined,
  migrationTime: number | null
): number | null {
  if (migrationTime === null || !Number.isFinite(migrationTime) || migrationTime < 0) return null
  if (!fromNode) return null
  const ops = fromNode.supportCost + fromNode.hostingCost
  if (!Number.isFinite(ops) || ops < 0) return null
  return edge.effort + ops * migrationTime
}

/**
 * Step-by-step payback simulation. Returns the full breakdown (every segment
 * plus the post-migration tail) and the month at which migration becomes the
 * cheaper option.
 *
 * Model:
 *  - At t = 0 we pay `migrationCost` once.
 *  - While we traverse edge `i` (duration `edgeTimes[i]`), we are still on
 *    `path[i]`, so we pay (support + hosting)(path[i]) per month.
 *  - After the last edge we are on `path[last]` (= target) and pay
 *    (support + hosting)(target) per month.
 *  - The upgrade scenario pays `monthlyUpgradeCost` from t = 0 onwards.
 *
 * Returns `null` for paybackMonths when inputs are insufficient or migration
 * is never cheaper than the upgrade. The breakdown is always populated when
 * inputs are well-formed, so the caller can render the comparison even when
 * payback is unreachable.
 */
export function simulatePaybackBreakdown(args: {
  path: GraphNode[]
  edgeTimes: number[]
  migrationCost: number
  monthlyUpgradeCost: number
}): PaybackBreakdown | null {
  const { path, edgeTimes, migrationCost, monthlyUpgradeCost } = args

  if (path.length < 2) return null
  if (edgeTimes.length !== path.length - 1) return null
  if (!Number.isFinite(migrationCost) || migrationCost < 0) return null
  if (!Number.isFinite(monthlyUpgradeCost) || monthlyUpgradeCost <= 0) return null
  for (const t of edgeTimes) {
    if (!Number.isFinite(t) || t < 0) return null
  }

  const segments: PaybackSegment[] = []
  let cumMigration = migrationCost
  let cumUpgrade = 0
  let segStart = 0
  let paybackMonths: number | null = null

  // Segment 0 — instantaneous migration-cost payment at t = 0.
  segments.push({
    kind: 'initial',
    fromName: '',
    toName: '',
    startMonth: 0,
    endMonth: 0,
    cumMigration,
    cumUpgrade,
    paybackReached: cumMigration <= cumUpgrade
  })
  if (cumMigration <= cumUpgrade) {
    paybackMonths = 0
  }

  const target = path[path.length - 1]
  if (!target) return null

  // Walk through every migration edge — we're still on the "from" node while
  // the migration is in progress.
  for (let i = 0; i < edgeTimes.length; i++) {
    const fromNode = path[i]
    const toNode = path[i + 1]
    if (!fromNode || !toNode) return null
    const slopeMigration = fromNode.supportCost + fromNode.hostingCost
    const segDuration = edgeTimes[i] ?? 0
    const slopeDiff = monthlyUpgradeCost - slopeMigration

    let segPayback = false
    if (paybackMonths === null && slopeDiff > 0) {
      const gap = cumMigration - cumUpgrade
      const dt = gap / slopeDiff
      if (dt >= 0 && dt <= segDuration) {
        paybackMonths = segStart + dt
        segPayback = true
      }
    }

    cumMigration += slopeMigration * segDuration
    cumUpgrade += monthlyUpgradeCost * segDuration
    segments.push({
      kind: 'edge',
      fromName: fromNode.name,
      toName: toNode.name,
      startMonth: segStart,
      endMonth: segStart + segDuration,
      cumMigration,
      cumUpgrade,
      paybackReached: segPayback
    })
    segStart += segDuration
  }

  // Tail segment — we've reached the target and operate on it forever.
  const targetSlope = target.supportCost + target.hostingCost
  const tailSlopeDiff = monthlyUpgradeCost - targetSlope

  let tailEnd: number | null = null
  let tailCumMigration = cumMigration
  let tailCumUpgrade = cumUpgrade
  let tailReached = false

  if (paybackMonths === null && tailSlopeDiff > 0) {
    const gap = cumMigration - cumUpgrade
    if (gap <= 0) {
      paybackMonths = segStart
      tailEnd = segStart
      tailReached = true
    } else {
      const dt = gap / tailSlopeDiff
      paybackMonths = segStart + dt
      tailEnd = segStart + dt
      tailCumMigration = cumMigration + targetSlope * dt
      tailCumUpgrade = cumUpgrade + monthlyUpgradeCost * dt
      tailReached = true
    }
  }

  segments.push({
    kind: 'target',
    fromName: target.name,
    toName: '',
    startMonth: segStart,
    endMonth: tailEnd,
    cumMigration: tailCumMigration,
    cumUpgrade: tailCumUpgrade,
    paybackReached: tailReached
  })

  return { segments, paybackMonths }
}

/** Backwards-compatible payback-only helper — derived from the breakdown. */
export function simulatePayback(args: {
  path: GraphNode[]
  edgeTimes: number[]
  migrationCost: number
  monthlyUpgradeCost: number
}): number | null {
  return simulatePaybackBreakdown(args)?.paybackMonths ?? null
}
