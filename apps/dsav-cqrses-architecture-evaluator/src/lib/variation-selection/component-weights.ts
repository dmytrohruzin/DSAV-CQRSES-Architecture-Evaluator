// =============================================================================
// Component Weights
// =============================================================================
// Builds and synchronizes per-metric component weights with the enabled
// quality attributes. Default values are injected by the caller so this
// module stays free of data-layer imports.

import type { ComponentWeights, QualityAttribute } from './types'

/** Seed weights for every enabled attribute from the provided defaults. */
export function buildDefaultComponentWeights(
  attributes: QualityAttribute[],
  defaults: Record<string, number>
): ComponentWeights {
  const out: ComponentWeights = {}
  for (const attr of attributes) {
    if (attr.enabled) {
      out[attr.metricKey] = { template: 'value', value: defaults[attr.metricKey] ?? 1 }
    }
  }
  return out
}

/**
 * Re-sync weights with an updated attribute list: enabled attributes keep
 * their existing weight (or get a default), weights of disabled/removed
 * attributes are dropped.
 */
export function syncComponentWeightsWithAttributes(
  prev: ComponentWeights,
  attributes: QualityAttribute[],
  defaults: Record<string, number>
): ComponentWeights {
  const updated: ComponentWeights = {}
  for (const attr of attributes) {
    if (attr.enabled) {
      updated[attr.metricKey] = prev[attr.metricKey] ?? {
        template: 'value',
        value: defaults[attr.metricKey] ?? 1
      }
    }
  }
  return updated
}
