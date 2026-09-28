// =============================================================================
// Variation Selection — Input Validation
// =============================================================================
// Domain validators for the variation-selection inputs. The composite
// `validateSelectionInputs` encodes the tab's calculate-gate: metric
// consistency, at least one variation, positive component weights and a
// valid swp.

import type { ValidationError } from '../validation/types'
import { isNonNegativeFinite, isPositiveFinite } from '../validation/validators'
import { validateAttributesParamsMetrics } from './quality-attributes'
import type { ComponentWeights, QualityAttribute, VariationMetrics } from './types'

/** Enabled attributes whose component weight is missing or not > 0. */
export function findInvalidWeightAttributes(
  attributes: QualityAttribute[],
  componentWeights: ComponentWeights
): QualityAttribute[] {
  return attributes.filter((attr) => {
    if (!attr.enabled) return false
    const weight = componentWeights[attr.metricKey]
    return !weight || !isPositiveFinite(weight.value)
  })
}

/** swp (development price of the simplest variation) must be finite and ≥ 0. */
export function validateSwp(swp: number): ValidationError[] {
  if (isNonNegativeFinite(swp)) return []
  return [
    {
      code: 'invalid_swp',
      message: `Development price (swp) must be a finite number ≥ 0 (got ${swp})`,
      field: 'swp',
      context: { value: String(swp) }
    }
  ]
}

export interface SelectionInputs {
  attributes: QualityAttribute[]
  variations: VariationMetrics[]
  componentWeights: ComponentWeights
  swp: number
}

/**
 * Composite validity check for the Calculate action. Returns every problem
 * found; an empty result means the calculation may run.
 */
export function validateSelectionInputs({
  attributes,
  variations,
  componentWeights,
  swp
}: SelectionInputs): ValidationError[] {
  const errors: ValidationError[] = [...validateAttributesParamsMetrics(attributes, variations)]

  if (variations.length === 0) {
    errors.push({
      code: 'missing_variations',
      message: 'At least one variation is required',
      field: 'variations',
      context: {}
    })
  }

  for (const attr of findInvalidWeightAttributes(attributes, componentWeights)) {
    const value = componentWeights[attr.metricKey]?.value
    errors.push({
      code: 'invalid_weight',
      message: `Component weight "${attr.metricKey}" must be a finite number > 0 (got ${value})`,
      field: `componentWeights.${attr.metricKey}`,
      context: { metricKey: attr.metricKey, value: String(value) }
    })
  }

  errors.push(...validateSwp(swp))

  return errors
}
