// =============================================================================
// Component Complexity Aggregation
// =============================================================================
// Single source for the per-component fuzzy classification: sums per-activity
// classes per axis and applies the design/realization weighted total. Inputs
// are re-validated here (defense in depth); a component with invalid
// activities yields a zeroed row carrying the validation errors.

import type { ValidationError } from '../validation/types'
import { nonNegativeNumber, numberAtMost } from '../validation/validators'
import { classify } from './classificator'
import type { ClassificatorSettings, Component, ComponentComplexityRow } from './types'

/** Relative weights of the design and realization axes (expected to sum to 1). */
export interface ComplexityWeights {
  designWeight: number
  realizationWeight: number
}

/**
 * Classify one activity value, recording a validation error and contributing
 * 0 to the sum when the value is negative, non-finite or exceeds the axis max.
 */
function classifyValue(value: number, maxValue: number, activityName: string, errors: ValidationError[]): number {
  const negativeErrors = nonNegativeNumber(value, activityName)
  if (negativeErrors.length > 0) {
    errors.push(...negativeErrors)
    return 0
  }

  const result = classify(value, maxValue)
  if (result === null) {
    errors.push(...numberAtMost(value, maxValue, activityName))
    return 0
  }
  return result
}

/**
 * Compute the classification row for every component.
 *
 * Returns an empty list when an axis maximum is not positive. A component
 * with invalid activity values yields `{ designClass: 0, realizationClass: 0,
 * total: 0 }` plus the collected `errors`.
 */
export function computeComponentComplexity(
  components: Component[],
  settings: ClassificatorSettings,
  weights: ComplexityWeights
): ComponentComplexityRow[] {
  const { designMaxValue, realizationMaxValue } = settings
  if (!Number.isFinite(designMaxValue) || !Number.isFinite(realizationMaxValue)) return []
  if (designMaxValue <= 0 || realizationMaxValue <= 0) return []

  return components.map((comp) => {
    const errors: ValidationError[] = []
    let designClass = 0
    let realizationClass = 0

    for (const act of comp.activities) {
      const activityName = act.name || '?'
      designClass += classifyValue(act.designComplexity, designMaxValue, activityName, errors)
      realizationClass += classifyValue(act.realizationComplexity, realizationMaxValue, activityName, errors)
    }

    if (errors.length > 0) {
      return { name: comp.name, designClass: 0, realizationClass: 0, total: 0, errors }
    }

    const total = weights.designWeight * designClass + weights.realizationWeight * realizationClass
    return { name: comp.name, designClass, realizationClass, total, errors }
  })
}

/**
 * Derive axis maximums from the largest activity values, rounded up to whole
 * numbers (the "auto-calculate max values" action).
 */
export function computeMaxComplexitySettings(components: Component[]): ClassificatorSettings {
  let maxDesign = 0
  let maxRealization = 0
  for (const comp of components) {
    for (const act of comp.activities) {
      if (act.designComplexity > maxDesign) maxDesign = act.designComplexity
      if (act.realizationComplexity > maxRealization) maxRealization = act.realizationComplexity
    }
  }
  return {
    designMaxValue: Math.ceil(maxDesign),
    realizationMaxValue: Math.ceil(maxRealization)
  }
}
