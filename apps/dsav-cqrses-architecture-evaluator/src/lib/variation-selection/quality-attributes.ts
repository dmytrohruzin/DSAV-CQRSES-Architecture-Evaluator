// =============================================================================
// Quality Attributes Engine
// =============================================================================
// Manages metric keys, validates attribute/metric consistency, and manages
// the list of quality attributes (toggle, add custom).

import type { ValidationError } from '../validation/types'
import type { QualityAttribute, QualityAttributeComponentType, VariationMetrics } from './types'

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Convert a human-readable name to camelCase: "Eventual Consistency" -> "eventualConsistency" */
export function toCamelCase(name: string): string {
  const words = name.trim().split(/\s+/)
  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

// -----------------------------------------------------------------------------
// Metric Key Helpers
// -----------------------------------------------------------------------------

/**
 * Generate a metric key for a quality attribute based on its name.
 * Each attribute has exactly one metric key (camelCase of its name).
 */
export function generateMetricKey(name: string): string {
  return toCamelCase(name)
}

/**
 * Collect all metric keys from enabled attributes only.
 * Returns a flat array preserving attribute order.
 */
export function getAllMetricKeys(attributes: QualityAttribute[]): string[] {
  return attributes.filter((attr) => attr.enabled).map((attr) => attr.metricKey)
}

// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

/**
 * Validate that every enabled attribute has a corresponding metric value
 * in every variation, and that all metric values are > 0.
 */
export function validateAttributesParamsMetrics(
  attributes: QualityAttribute[],
  variations: VariationMetrics[]
): ValidationError[] {
  const errors: ValidationError[] = []
  const activeAttributes = attributes.filter((attr) => attr.enabled)
  const activeMetricKeys = getAllMetricKeys(activeAttributes)

  for (const variation of variations) {
    for (const key of activeMetricKeys) {
      const value = variation.metrics[key]
      if (value === undefined) {
        errors.push({
          code: 'missing_metric',
          message: `Variation "${variation.name}" is missing metric "${key}"`,
          field: `variations.${variation.name}.metrics.${key}`,
          context: { variation: variation.name, metricKey: key }
        })
      } else if (value <= 0) {
        errors.push({
          code: 'invalid_value',
          message: `Variation "${variation.name}" metric "${key}" must be > 0 (got ${value})`,
          field: `variations.${variation.name}.metrics.${key}`,
          context: { variation: variation.name, metricKey: key, value }
        })
      }
    }
  }

  return errors
}

// -----------------------------------------------------------------------------
// Attribute Management
// -----------------------------------------------------------------------------

/** Toggle a quality attribute on or off by name. */
export function toggleAttribute(attributes: QualityAttribute[], name: string): QualityAttribute[] {
  return attributes.map((attr) => (attr.name === name ? { ...attr, enabled: !attr.enabled } : attr))
}

/** Remove a quality attribute by name. */
export function removeAttribute(attributes: QualityAttribute[], name: string): QualityAttribute[] {
  return attributes.filter((attr) => attr.name !== name)
}

/** Add a custom complexity quality attribute with auto-generated metric key. */
export function addCustomAttribute(
  attributes: QualityAttribute[],
  name: string,
  componentType: QualityAttributeComponentType,
  weightCriterion = ''
): QualityAttribute[] {
  const newAttribute: QualityAttribute = {
    name,
    type: 'complexity',
    componentType,
    enabled: true,
    metricKey: generateMetricKey(name),
    weightCriterion
  }

  return [...attributes, newAttribute]
}
