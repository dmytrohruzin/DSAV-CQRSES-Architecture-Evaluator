import { describe, expect, it } from 'vitest'

import { DEFAULT_QUALITY_ATTRIBUTES } from '../../data/default-quality-attributes'

import {
  addCustomAttribute,
  generateMetricKey,
  getAllMetricKeys,
  removeAttribute,
  toCamelCase,
  toggleAttribute,
  validateAttributesParamsMetrics
} from './quality-attributes'
import type { QualityAttribute, VariationMetrics } from './types'

// ---------------------------------------------------------------------------
// Helpers — factories
// ---------------------------------------------------------------------------

function makeAttribute(overrides: Partial<QualityAttribute> & Pick<QualityAttribute, 'name'>): QualityAttribute {
  const base: QualityAttribute = {
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: '',
    weightCriterion: '',
    ...overrides
  }
  if (!base.metricKey) {
    base.metricKey = generateMetricKey(base.name)
  }
  return base
}

function makeVariation(name: string, metrics: Record<string, number>): VariationMetrics {
  return { name, metrics }
}

// ---------------------------------------------------------------------------
// toCamelCase
// ---------------------------------------------------------------------------

describe('toCamelCase', () => {
  it('converts a multi-word string to camelCase', () => {
    expect(toCamelCase('Eventual Consistency')).toBe('eventualConsistency')
  })

  it('returns a lowercase single word unchanged', () => {
    expect(toCamelCase('Query')).toBe('query')
  })

  it('lowercases an already-camelCase input', () => {
    expect(toCamelCase('camelCase')).toBe('camelcase')
  })

  it('handles strings with extra whitespace', () => {
    expect(toCamelCase('  Read   Performance  ')).toBe('readPerformance')
  })

  it('handles three-word strings', () => {
    expect(toCamelCase('Change Event Types')).toBe('changeEventTypes')
  })
})

// ---------------------------------------------------------------------------
// generateMetricKey
// ---------------------------------------------------------------------------

describe('generateMetricKey', () => {
  it('camelCases a single word', () => {
    expect(generateMetricKey('Create')).toBe('create')
  })

  it('camelCases a multi-word name', () => {
    expect(generateMetricKey('Change Event Types')).toBe('changeEventTypes')
  })
})

// ---------------------------------------------------------------------------
// getAllMetricKeys
// ---------------------------------------------------------------------------

describe('getAllMetricKeys', () => {
  it('returns keys only from enabled attributes', () => {
    const attributes: QualityAttribute[] = [
      makeAttribute({ name: 'Create', enabled: true }),
      makeAttribute({ name: 'Update', enabled: false }),
      makeAttribute({ name: 'Audit Log', enabled: true })
    ]
    expect(getAllMetricKeys(attributes)).toEqual(['create', 'auditLog'])
  })

  it('returns empty array when all attributes are disabled', () => {
    const attributes: QualityAttribute[] = [
      makeAttribute({ name: 'Create', enabled: false }),
      makeAttribute({ name: 'Query', enabled: false })
    ]
    expect(getAllMetricKeys(attributes)).toEqual([])
  })

  it('returns empty array for empty input', () => {
    expect(getAllMetricKeys([])).toEqual([])
  })

  it('preserves attribute order', () => {
    const attributes: QualityAttribute[] = [
      makeAttribute({ name: 'Audit Log', enabled: true }),
      makeAttribute({ name: 'Create', enabled: true })
    ]
    expect(getAllMetricKeys(attributes)).toEqual(['auditLog', 'create'])
  })
})

// ---------------------------------------------------------------------------
// DEFAULT_QUALITY_ATTRIBUTES
// ---------------------------------------------------------------------------

describe('DEFAULT_QUALITY_ATTRIBUTES', () => {
  it('contains 12 complexity attributes', () => {
    expect(DEFAULT_QUALITY_ATTRIBUTES).toHaveLength(12)
    expect(DEFAULT_QUALITY_ATTRIBUTES.every((a) => a.type === 'complexity')).toBe(true)
  })

  it('produces 12 metric keys when all attributes are enabled', () => {
    expect(getAllMetricKeys(DEFAULT_QUALITY_ATTRIBUTES)).toHaveLength(12)
  })

  it('has all attributes enabled by default', () => {
    expect(DEFAULT_QUALITY_ATTRIBUTES.every((a) => a.enabled)).toBe(true)
  })

  it('contains 10 OQAC and 2 PSQAC complexity attributes', () => {
    const oqac = DEFAULT_QUALITY_ATTRIBUTES.filter((a) => a.componentType === 'OQAC')
    const psqac = DEFAULT_QUALITY_ATTRIBUTES.filter((a) => a.componentType === 'PSQAC')
    expect(oqac).toHaveLength(10)
    expect(psqac).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// toggleAttribute
// ---------------------------------------------------------------------------

describe('toggleAttribute', () => {
  it('disables an enabled attribute', () => {
    const attributes = [
      makeAttribute({ name: 'Create', enabled: true }),
      makeAttribute({ name: 'Query', enabled: true })
    ]
    const result = toggleAttribute(attributes, 'Create')
    expect(result[0]?.enabled).toBe(false)
    expect(result[1]?.enabled).toBe(true)
  })

  it('enables a disabled attribute', () => {
    const attributes = [makeAttribute({ name: 'Create', enabled: false })]
    expect(toggleAttribute(attributes, 'Create')[0]?.enabled).toBe(true)
  })

  it('returns a new array (does not mutate input)', () => {
    const attributes = [makeAttribute({ name: 'Create', enabled: true })]
    const result = toggleAttribute(attributes, 'Create')
    expect(result).not.toBe(attributes)
    expect(attributes[0]?.enabled).toBe(true)
  })

  it('leaves attributes unchanged when no name matches', () => {
    const attributes = [makeAttribute({ name: 'Create', enabled: true })]
    expect(toggleAttribute(attributes, 'NonExistent')[0]?.enabled).toBe(true)
  })

  it('handles an empty array', () => {
    expect(toggleAttribute([], 'Create')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// removeAttribute
// ---------------------------------------------------------------------------

describe('removeAttribute', () => {
  it('removes an attribute by name', () => {
    const attributes = [makeAttribute({ name: 'Create' }), makeAttribute({ name: 'Query' })]
    const result = removeAttribute(attributes, 'Create')
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Query')
  })

  it('returns a new array (does not mutate input)', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const result = removeAttribute(attributes, 'Create')
    expect(result).not.toBe(attributes)
    expect(attributes).toHaveLength(1)
  })

  it('returns unchanged array when no name matches', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    expect(removeAttribute(attributes, 'NonExistent')).toHaveLength(1)
  })

  it('handles an empty array', () => {
    expect(removeAttribute([], 'Create')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// addCustomAttribute
// ---------------------------------------------------------------------------

describe('addCustomAttribute', () => {
  it('adds a complexity OQAC attribute with auto-generated metric key', () => {
    const result = addCustomAttribute([], 'Audit Trail', 'OQAC')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      name: 'Audit Trail',
      type: 'complexity',
      componentType: 'OQAC',
      enabled: true,
      metricKey: 'auditTrail',
      weightCriterion: ''
    })
  })

  it('adds a PSQAC attribute with auto-generated metric key', () => {
    const result = addCustomAttribute([], 'Custom Metric', 'PSQAC')
    expect(result[0]?.metricKey).toBe('customMetric')
    expect(result[0]?.componentType).toBe('PSQAC')
  })

  it('appends to existing attributes without mutating the original', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const result = addCustomAttribute(attributes, 'Custom', 'OQAC')
    expect(result).toHaveLength(2)
    expect(attributes).toHaveLength(1)
    expect(result).not.toBe(attributes)
  })

  it('accepts a custom weightCriterion', () => {
    const result = addCustomAttribute([], 'Audit Trail', 'OQAC', 'audit calls')
    expect(result[0]?.weightCriterion).toBe('audit calls')
  })

  it('handles multi-word names', () => {
    const result = addCustomAttribute([], 'My Custom Metric', 'OQAC')
    expect(result[0]?.metricKey).toBe('myCustomMetric')
  })
})

// ---------------------------------------------------------------------------
// validateAttributesParamsMetrics
// ---------------------------------------------------------------------------

describe('validateAttributesParamsMetrics', () => {
  it('returns an empty array when every active metric has a positive value in every variation', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const variations = [makeVariation('A', { create: 1 })]
    expect(validateAttributesParamsMetrics(attributes, variations)).toEqual([])
  })

  it('reports missing_metric when a variation lacks a required metric', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const variations = [makeVariation('A', {})]
    const errors = validateAttributesParamsMetrics(attributes, variations)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.code).toBe('missing_metric')
    expect(errors[0]?.message).toContain('create')
  })

  it('reports invalid_value when a metric is zero or negative', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const variations = [makeVariation('A', { create: 0 })]
    const errors = validateAttributesParamsMetrics(attributes, variations)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.code).toBe('invalid_value')
  })

  it('skips disabled attributes', () => {
    const attributes = [makeAttribute({ name: 'Create', enabled: false })]
    const variations = [makeVariation('A', {})]
    expect(validateAttributesParamsMetrics(attributes, variations)).toEqual([])
  })

  it('reports errors across multiple variations', () => {
    const attributes = [makeAttribute({ name: 'Create' })]
    const variations = [makeVariation('A', {}), makeVariation('B', {})]
    const errors = validateAttributesParamsMetrics(attributes, variations)
    expect(errors).toHaveLength(2)
  })

  it('handles empty inputs without errors', () => {
    expect(validateAttributesParamsMetrics([], [])).toEqual([])
  })
})
