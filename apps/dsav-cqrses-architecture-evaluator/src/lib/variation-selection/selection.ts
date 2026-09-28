// =============================================================================
// Variation Selection — SLA + Cost Optimization
// =============================================================================
// Pure functions that combine the relative integral complexity (rc_i) from
// `applicability.ts`, SLA-driven hardware selection, and the user-provided swp
// into the final optimal-variation table.

import type {
  HardwareConfig,
  OptimalResult,
  RelativeComplexityResult,
  RelativeHostingPriceResult,
  SlaParameter,
  VariationHardwareData
} from './types'

/**
 * Find the minimum among finite positive values; null when none qualifies.
 * Used for the relative-hosting-price reference (isMin) computation.
 */
function minPositiveValue(values: Array<number | null>): number | null {
  let min: number | null = null
  for (const value of values) {
    if (value === null || !Number.isFinite(value) || value <= 0) continue
    if (min === null || value < min) min = value
  }
  return min
}

/**
 * Pick the cheapest hardware config that satisfies every SLA parameter.
 * Returns null when no config qualifies (or the inputs are empty).
 *
 * SLA satisfaction rule:
 *  - direction = 'less-better' → measured value ≤ slaThreshold
 *  - direction = 'more-better' → measured value ≥ slaThreshold
 *
 * Configs with non-finite price or missing SLA values are excluded.
 * Ties on price are broken by input order (stable sort).
 */
export function pickCheapestConfigSatisfyingSla(
  configs: HardwareConfig[],
  slaParameters: SlaParameter[]
): HardwareConfig | null {
  if (configs.length === 0) return null

  const satisfying = configs.filter((config) => {
    if (!Number.isFinite(config.pricePerMonthUsd) || config.pricePerMonthUsd <= 0) return false
    for (const sla of slaParameters) {
      const measured = config.slaValues[sla.id]
      if (measured === undefined || !Number.isFinite(measured)) return false
      if (sla.direction === 'less-better' && measured > sla.slaThreshold) return false
      if (sla.direction === 'more-better' && measured < sla.slaThreshold) return false
    }
    return true
  })

  let cheapest: HardwareConfig | null = null
  for (const candidate of satisfying) {
    if (cheapest === null || candidate.pricePerMonthUsd < cheapest.pricePerMonthUsd) {
      cheapest = candidate
    }
  }
  return cheapest
}

/**
 * Combine relative complexity, per-variation hardware data, SLA constraints,
 * and the user-provided swp into the final result table.
 *
 * For each variation:
 *  - pick the cheapest SLA-satisfying hardware config
 *  - developmentCost = swp × rc
 *  - totalCost = developmentCost + cheapestConfig.pricePerMonthUsd (null when SLA unmet)
 *
 * `isOptimal` is set on the row with the lowest totalCost among rows whose
 * SLA is met. Ties resolve to the first occurrence.
 */
export function computeOptimalVariation(
  relativeComplexities: RelativeComplexityResult[],
  hardwareData: VariationHardwareData[],
  slaParameters: SlaParameter[],
  swp: number
): OptimalResult[] {
  const swpValid = Number.isFinite(swp) && swp >= 0

  const rows: OptimalResult[] = relativeComplexities.map((rc) => {
    const block = hardwareData.find((h) => h.variationName === rc.name)
    const cheapest = block ? pickCheapestConfigSatisfyingSla(block.configs, slaParameters) : null
    const slaUnmet = cheapest === null
    const developmentCost = swpValid ? swp * rc.rc : null
    const hardwarePrice = cheapest ? cheapest.pricePerMonthUsd : null
    const totalCost =
      !slaUnmet && developmentCost !== null && hardwarePrice !== null ? developmentCost + hardwarePrice : null

    return {
      variationName: rc.name,
      rc: rc.rc,
      cheapestConfig: cheapest,
      hardwarePrice,
      developmentCost,
      totalCost,
      isOptimal: false,
      slaUnmet
    }
  })

  // Mark the optimal (minimum totalCost) row among SLA-satisfying rows.
  let bestRow: OptimalResult | null = null
  for (const row of rows) {
    if (row.totalCost === null) continue
    if (bestRow === null || row.totalCost < (bestRow.totalCost ?? Number.POSITIVE_INFINITY)) {
      bestRow = row
    }
  }
  if (bestRow !== null) {
    bestRow.isOptimal = true
  }

  return rows
}

/**
 * Convert per-variation cheapest hardware prices into relative hosting prices
 * pc_i = price_i / price_min. The variation with the minimum cheapest price
 * becomes the reference (pc = 1, isMin = true); others have pc > 1.
 *
 * Variations whose SLA is unmet (no valid cheapest config) get price = pc = null
 * and slaUnmet = true; they do not participate in the price_min computation.
 */
export function computeRelativeHostingPrice(optimalResults: OptimalResult[]): RelativeHostingPriceResult[] {
  if (optimalResults.length === 0) return []

  const priceMin = minPositiveValue(optimalResults.map((r) => r.hardwarePrice))
  if (priceMin === null) {
    return optimalResults.map((r) => ({
      name: r.variationName,
      price: null,
      pc: null,
      isMin: false,
      slaUnmet: r.slaUnmet
    }))
  }

  let minAssigned = false
  return optimalResults.map((r) => {
    if (r.hardwarePrice === null || !Number.isFinite(r.hardwarePrice) || r.hardwarePrice <= 0) {
      return { name: r.variationName, price: null, pc: null, isMin: false, slaUnmet: r.slaUnmet }
    }
    const isMin = !minAssigned && r.hardwarePrice === priceMin
    if (isMin) minAssigned = true
    return {
      name: r.variationName,
      price: r.hardwarePrice,
      pc: r.hardwarePrice / priceMin,
      isMin,
      slaUnmet: r.slaUnmet
    }
  })
}
