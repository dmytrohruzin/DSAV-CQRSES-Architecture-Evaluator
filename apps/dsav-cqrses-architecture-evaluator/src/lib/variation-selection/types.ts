// =============================================================================
// Variation Selection — Type Definitions
// =============================================================================
// Quality attributes, variation metrics, applicability scores plus the SLA,
// hardware and optimal-result types.

/** Type of quality attribute determining the evaluation category */
export type QualityAttributeType = 'complexity'

/** Component type classifying the quality attribute origin */
export type QualityAttributeComponentType = 'OQAC' | 'PSQAC'

/** A quality attribute used in the DSAV-CQRSES evaluation */
export interface QualityAttribute {
  name: string
  type: QualityAttributeType
  componentType: QualityAttributeComponentType
  enabled: boolean
  metricKey: string
  weightCriterion: string
}

/** Measured metrics for a single architectural variation */
export interface VariationMetrics {
  name: string
  metrics: Record<string, number>
}

/** Integral complexity score (r_i, %) for a single variation */
export interface ApplicabilityResult {
  name: string
  applicability: number
}

/** Normalized weight for a single metric key */
export interface WeightData {
  metricKey: string
  weight: number
}

/** Per-metric component weight with its UI template selection. */
export interface ComponentWeight {
  template: string
  value: number
}

/** Component weights for all enabled attributes, keyed by metric key. */
export type ComponentWeights = Record<string, ComponentWeight>

/** Direction of an SLA parameter: lower-is-better or higher-is-better. */
export type SlaDirection = 'less-better' | 'more-better'

/** A user-defined Service Level Agreement parameter with a threshold. */
export interface SlaParameter {
  id: string
  name: string
  unit: string
  direction: SlaDirection
  slaThreshold: number
}

/** A single hardware configuration with its monthly price and SLA-parameter values. */
export interface HardwareConfig {
  id: string
  name: string
  pricePerMonthUsd: number
  /** Measured value per SLA parameter, keyed by SlaParameter.id. */
  slaValues: Record<string, number>
}

/** Hardware-configuration set for a single architectural variation. */
export interface VariationHardwareData {
  variationName: string
  configs: HardwareConfig[]
}

/** Relative complexity outcome per variation. */
export interface RelativeComplexityResult {
  name: string
  /** Integral complexity score (normalized percentage). */
  r: number
  /** Relative complexity: r / r_min, ≥ 1. */
  rc: number
  /** Whether this variation is the minimum-complexity reference. */
  isMin: boolean
}

/** Relative hosting price outcome per variation. */
export interface RelativeHostingPriceResult {
  name: string
  /** Cheapest SLA-satisfying hardware price (USD/month); null if SLA unmet. */
  price: number | null
  /** Relative hosting price: price / price_min, ≥ 1; null if SLA unmet. */
  pc: number | null
  /** Whether this variation is the minimum-price reference. */
  isMin: boolean
  /** True when no hardware config satisfies the SLA. */
  slaUnmet: boolean
}

/** Final optimal-variation-selection outcome per variation. */
export interface OptimalResult {
  variationName: string
  rc: number
  /** Cheapest hardware config that satisfies all SLA, or null if none does. */
  cheapestConfig: HardwareConfig | null
  hardwarePrice: number | null
  /** swp × rc, regardless of SLA outcome. */
  developmentCost: number | null
  /** swp × rc + hardwarePrice, or null when slaUnmet. */
  totalCost: number | null
  /** True for the variation with the minimum totalCost among SLA-satisfying rows. */
  isOptimal: boolean
  /** True when no hardware config satisfies the SLA. */
  slaUnmet: boolean
}
