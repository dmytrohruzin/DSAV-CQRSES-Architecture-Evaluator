import { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateFeasibility, DEFAULT_HARDWARE_UPGRADE, DEFAULT_MIGRATION_COST } from '../lib/feasibility/feasibility'
import { deriveHardwareUpgradeSupport } from '../lib/feasibility/hardware-upgrade'
import { summarizeMigrationPaths } from '../lib/feasibility/path-summary'
import type { FeasibilityPath } from '../lib/feasibility/types'
import type { GraphNode } from '../lib/migration/types'

export type { FeasibilityPath } from '../lib/feasibility/types'

interface UseFeasibilityAssessmentArgs {
  source: GraphNode | null
  target: GraphNode | null
  /**
   * All viable migration paths from source to target. The first entry is the
   * recommended (pathfinder-optimal) path and is selected by default; the user
   * can switch to any other path via the summary table.
   */
  paths: FeasibilityPath[]
}

/**
 * State, derived data and handlers for the Feasibility Assessment section:
 * scenario inputs (hardware-upgrade hosting, per-path migration costs), path
 * selection kept in sync with the recommended path, the feasibility result
 * and the per-path payback summary. All calculations live in
 * src/lib/feasibility.
 */
export function useFeasibilityAssessment({ source, target, paths }: UseFeasibilityAssessmentArgs) {
  const recommendedId = paths[0]?.id ?? null

  const [enabled, setEnabled] = useState(false)
  const [hardwareHosting, setHardwareHosting] = useState<number>(DEFAULT_HARDWARE_UPGRADE.hosting)
  const [pathMigrationCosts, setPathMigrationCosts] = useState<Record<string, number>>({})
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)

  // Keep selection aligned with the recommended path whenever the path set
  // changes (e.g. Find Optimal Path was clicked again).
  useEffect(() => {
    if (selectedPathId === null && recommendedId !== null) {
      setSelectedPathId(recommendedId)
      return
    }
    if (selectedPathId !== null && !paths.some((p) => p.id === selectedPathId)) {
      setSelectedPathId(recommendedId)
    }
  }, [paths, recommendedId, selectedPathId])

  const selectedPath = useMemo(
    () => paths.find((p) => p.id === selectedPathId) ?? paths[0] ?? null,
    [paths, selectedPathId]
  )

  const migrationCost = selectedPath
    ? (pathMigrationCosts[selectedPath.id] ?? DEFAULT_MIGRATION_COST)
    : DEFAULT_MIGRATION_COST

  const hardwareSupport = deriveHardwareUpgradeSupport(source)

  const result = useMemo(
    () =>
      calculateFeasibility({
        source,
        target,
        path: selectedPath?.pathNodes ?? null,
        pathEdgeTimes: selectedPath?.pathEdgeTimes ?? null,
        hardwareUpgrade: { support: hardwareSupport, hosting: hardwareHosting },
        migrationCost
      }),
    [source, target, selectedPath, hardwareSupport, hardwareHosting, migrationCost]
  )

  const handleToggle = useCallback(() => setEnabled((v) => !v), [])

  const handleHardwareHosting = useCallback((value: number) => setHardwareHosting(value), [])

  const handlePathCost = useCallback(
    (id: string, value: number) => setPathMigrationCosts((prev) => ({ ...prev, [id]: value })),
    []
  )

  const handleSelectPath = useCallback((id: string) => setSelectedPathId(id), [])

  const monthlyUpgradeTotal = result.monthlyUpgradeTotal

  const pathSummary = useMemo(
    () =>
      summarizeMigrationPaths({
        paths,
        migrationCosts: pathMigrationCosts,
        defaultMigrationCost: DEFAULT_MIGRATION_COST,
        monthlyUpgradeCost: monthlyUpgradeTotal
      }),
    [paths, pathMigrationCosts, monthlyUpgradeTotal]
  )

  return {
    enabled,
    hardwareHosting,
    pathMigrationCosts,
    selectedPathId,
    recommendedId,
    selectedPath,
    migrationCost,
    hardwareSupport,
    result,
    monthlyUpgradeTotal,
    pathSummary,
    handleToggle,
    handleHardwareHosting,
    handlePathCost,
    handleSelectPath
  }
}
