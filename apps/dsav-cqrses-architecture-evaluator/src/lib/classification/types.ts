// =============================================================================
// Complexity Classification — Type Definitions
// =============================================================================

import type { ValidationError } from '../validation/types'

/** A single activity within a component, with design and realization complexity values */
export interface Activity {
  name: string
  designComplexity: number
  realizationComplexity: number
}

/** A component containing a list of activities (e.g., Create, Update, Query) */
export interface Component {
  name: string
  activities: Activity[]
}

/** Result of fuzzy-logic complexity classification for a single component */
export interface ComplexityResult {
  name: string
  designClass: number
  realizationClass: number
  total: number
}

/**
 * Per-component classification row including input-validation outcomes.
 * When `errors` is non-empty the class values are zeroed.
 */
export interface ComponentComplexityRow extends ComplexityResult {
  errors: ValidationError[]
}

/** Configuration for the fuzzy-logic classificator axis maximums */
export interface ClassificatorSettings {
  designMaxValue: number
  realizationMaxValue: number
}
