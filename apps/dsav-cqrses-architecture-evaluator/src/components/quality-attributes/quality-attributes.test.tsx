import { afterEach, describe, expect, it, vi } from 'vitest'
import type { QualityAttribute } from '../../lib/variation-selection/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { QualityAttributes } from './quality-attributes'

vi.mock('../../lib/quality-attributes', () => ({
  toggleAttribute: vi.fn((attrs: QualityAttribute[], name: string) =>
    attrs.map((a) => (a.name === name ? { ...a, enabled: !a.enabled } : a))
  ),
  removeAttribute: vi.fn((attrs: QualityAttribute[], name: string) => attrs.filter((a) => a.name !== name)),
  addCustomAttribute: vi.fn(
    (attrs: QualityAttribute[], name: string, componentType: 'OQAC' | 'PSQAC', weightCriterion = '') => [
      ...attrs,
      {
        name,
        type: 'complexity' as const,
        componentType,
        enabled: true,
        metricKey: name.replace(/\s+/g, '').toLowerCase(),
        weightCriterion
      }
    ]
  ),
  getAllMetricKeys: vi.fn((attrs: QualityAttribute[]) => attrs.filter((a) => a.enabled).map((a) => a.metricKey))
}))

function createAttribute(overrides: Partial<QualityAttribute> = {}): QualityAttribute {
  return {
    name: 'Test Attr',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'testAttr',
    weightCriterion: '',
    ...overrides
  }
}

function createDefaultProps(overrides: Partial<Parameters<typeof QualityAttributes>[0]> = {}) {
  return {
    attributes: [] as QualityAttribute[],
    onAttributesChange: vi.fn(),
    ...overrides
  }
}

function createDefaultAttributes(): QualityAttribute[] {
  return [
    createAttribute({ name: 'Development of Create Command', metricKey: 'createDevelopment' }),
    createAttribute({ name: 'Modification of Create Command', metricKey: 'createModification' }),
    createAttribute({ name: 'Development of Update Command', metricKey: 'updateDevelopment' }),
    createAttribute({ name: 'Modification of Update Command', metricKey: 'updateModification' }),
    createAttribute({ name: 'Development of Eventual Consistency', metricKey: 'ecDevelopment' }),
    createAttribute({ name: 'Modification of Eventual Consistency', metricKey: 'ecModification' }),
    createAttribute({ name: 'Development of Query', metricKey: 'queryDevelopment' }),
    createAttribute({ name: 'Modification of Query', metricKey: 'queryModification' }),
    createAttribute({ name: 'Development of Projection Rebuild', metricKey: 'projRebuildDev' }),
    createAttribute({ name: 'Modification of Projection Rebuild', metricKey: 'projRebuildMod' }),
    createAttribute({ name: 'Change Event Types', componentType: 'PSQAC', metricKey: 'changeEventTypes' }),
    createAttribute({ name: 'Data Removing', componentType: 'PSQAC', metricKey: 'dataRemoving' })
  ]
}

describe('QualityAttributes', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the complexity attributes group', () => {
      const props = createDefaultProps({ attributes: createDefaultAttributes() })
      render(<QualityAttributes {...props} />)
      expect(screen.getByLabelText('Complexity Attributes')).toBeInTheDocument()
    })

    it('renders a toggle for every attribute', () => {
      const attributes = createDefaultAttributes()
      render(<QualityAttributes {...createDefaultProps({ attributes })} />)
      for (const attr of attributes) {
        expect(screen.getByLabelText(`Toggle ${attr.name}`)).toBeInTheDocument()
      }
    })

    it('renders OQAC and PSQAC component-type badges', () => {
      const attributes = [
        createAttribute({ name: 'Create', componentType: 'OQAC', metricKey: 'create' }),
        createAttribute({ name: 'Change Event Types', componentType: 'PSQAC', metricKey: 'changeEventTypes' })
      ]
      render(<QualityAttributes {...createDefaultProps({ attributes })} />)
      expect(screen.getAllByText('OQAC').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('PSQAC').length).toBeGreaterThanOrEqual(1)
    })

    it('renders a delete button for every attribute', () => {
      const attributes = [
        createAttribute({ name: 'Create', metricKey: 'create' }),
        createAttribute({ name: 'Audit Trail', metricKey: 'auditTrail' })
      ]
      render(<QualityAttributes {...createDefaultProps({ attributes })} />)
      expect(screen.getByLabelText('Remove Create')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove Audit Trail')).toBeInTheDocument()
    })
  })

  describe('toggling', () => {
    it('calls onAttributesChange with the toggled attribute', () => {
      const attributes = createDefaultAttributes()
      const props = createDefaultProps({ attributes })
      render(<QualityAttributes {...props} />)

      fireEvent.click(screen.getByLabelText('Toggle Development of Create Command'))

      expect(props.onAttributesChange).toHaveBeenCalledTimes(1)
      const result = vi.mocked(props.onAttributesChange).mock.calls[0]?.[0] as QualityAttribute[]
      const target = result.find((a) => a.name === 'Development of Create Command')
      expect(target?.enabled).toBe(false)
    })

    it('enables a disabled attribute when toggled', () => {
      const attributes = [createAttribute({ name: 'Create', enabled: false, metricKey: 'create' })]
      const props = createDefaultProps({ attributes })
      render(<QualityAttributes {...props} />)

      fireEvent.click(screen.getByLabelText('Toggle Create'))

      const result = vi.mocked(props.onAttributesChange).mock.calls[0]?.[0] as QualityAttribute[]
      expect(result.find((a) => a.name === 'Create')?.enabled).toBe(true)
    })
  })

  describe('removing', () => {
    it('calls onAttributesChange without the removed attribute', () => {
      const attributes = [
        createAttribute({ name: 'Create', metricKey: 'create' }),
        createAttribute({ name: 'Update', metricKey: 'update' })
      ]
      const props = createDefaultProps({ attributes })
      render(<QualityAttributes {...props} />)

      fireEvent.click(screen.getByLabelText('Remove Create'))

      expect(props.onAttributesChange).toHaveBeenCalledTimes(1)
      const result = vi.mocked(props.onAttributesChange).mock.calls[0]?.[0] as QualityAttribute[]
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Update')
    })
  })
})
