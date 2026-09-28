// =============================================================================
// Hardware Upgrade Scenario Rules
// =============================================================================

import type { GraphNode } from '../migration/types'

/**
 * Support cost in the "Hardware upgrade" scenario mirrors the source node —
 * only the hosting hardware is upgraded; the support team stays the same.
 * Returns 0 when there is no source.
 */
export function deriveHardwareUpgradeSupport(source: GraphNode | null): number {
  return source?.supportCost ?? 0
}
