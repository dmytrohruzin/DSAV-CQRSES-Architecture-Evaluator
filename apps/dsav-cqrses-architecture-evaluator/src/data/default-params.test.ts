import { describe, expect, it } from 'vitest'
import { DEFAULT_CLASSIFICATOR_SETTINGS } from '../lib/classification/classificator'
import { computeComponentComplexity } from '../lib/classification/component-complexity'
import type { Component } from '../lib/classification/types'
import { DEFAULT_CLASSICAL_CQRS_COMPONENTS, DEFAULT_MCQRS_COMPONENTS } from './default-complexity-data'
import { DEFAULT_CLASSICAL_CQRS_METRICS, DEFAULT_MCQRS_METRICS } from './default-params'
import { DEFAULT_QUALITY_ATTRIBUTES } from './default-quality-attributes'

// ---------------------------------------------------------------------------
// Tests — Default Variation Metrics
// ---------------------------------------------------------------------------
// The metrics are the per-component classification totals of the default
// complexity dataset, so the two files must stay in lockstep: an edit to an
// activity's complexity has to be reflected in the variation metrics.

/** Weights used by the Parameters Assessment page. */
const WEIGHTS = { designWeight: 0.5, realizationWeight: 0.5 }

const METRIC_KEYS = DEFAULT_QUALITY_ATTRIBUTES.filter((a) => a.type === 'complexity').map((a) => a.metricKey)

function expectMetricsMatchComponents(components: Component[], metrics: Record<string, number>) {
  const rows = computeComponentComplexity(components, DEFAULT_CLASSIFICATOR_SETTINGS, WEIGHTS)

  expect(rows).toHaveLength(METRIC_KEYS.length)
  rows.forEach((row, index) => {
    const key = METRIC_KEYS[index] as string
    expect(row.errors).toEqual([])
    expect(metrics[key], `${key} (${row.name})`).toBeCloseTo(row.total, 2)
  })
}

describe('Default Variation Metrics', () => {
  it('should cover every complexity metric key exactly once', () => {
    // Assert
    expect(Object.keys(DEFAULT_CLASSICAL_CQRS_METRICS)).toEqual(METRIC_KEYS)
    expect(Object.keys(DEFAULT_MCQRS_METRICS)).toEqual(METRIC_KEYS)
  })

  it('should match the classification totals of the Classical CQRS components', () => {
    // Assert
    expectMetricsMatchComponents(DEFAULT_CLASSICAL_CQRS_COMPONENTS, DEFAULT_CLASSICAL_CQRS_METRICS)
  })

  it('should match the classification totals of the mCQRS components', () => {
    // Assert
    expectMetricsMatchComponents(DEFAULT_MCQRS_COMPONENTS, DEFAULT_MCQRS_METRICS)
  })
})
