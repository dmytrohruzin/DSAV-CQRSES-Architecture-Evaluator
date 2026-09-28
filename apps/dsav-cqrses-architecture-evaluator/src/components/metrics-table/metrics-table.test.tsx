import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '../../test-utils'
import { MetricsTable } from './metrics-table'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createVariation(
  name: string,
  metrics: Record<string, number> = {}
): { name: string; metrics: Record<string, number> } {
  return { name, metrics }
}

function createDefaultProps(overrides: Partial<Parameters<typeof MetricsTable>[0]> = {}) {
  return {
    metricKeys: ['createDevelopment', 'createModification', 'read'],
    variations: [] as Array<{ name: string; metrics: Record<string, number> }>,
    onVariationsChange: vi.fn(),
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MetricsTable', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('rendering', () => {
    it('should render table with correct metric rows and variation columns', () => {
      // Arrange
      const metricKeys = ['createDevelopment', 'createModification', 'read']
      const variations = [
        createVariation('CQRS', { createDevelopment: 3, createModification: 2, read: 5 }),
        createVariation('ES', { createDevelopment: 4, createModification: 1, read: 6 })
      ]
      const props = createDefaultProps({ metricKeys, variations })

      // Act
      render(<MetricsTable {...props} />)

      // Assert — table has correct structure
      const table = screen.getByLabelText('Variation metrics')
      expect(within(table).getByText('CQRS')).toBeInTheDocument()
      expect(within(table).getByText('ES')).toBeInTheDocument()
      expect(within(table).getByText('createDevelopment')).toBeInTheDocument()
      expect(within(table).getByText('createModification')).toBeInTheDocument()
      expect(within(table).getByText('read')).toBeInTheDocument()
    })

    it('should render NxM table — 3 metric rows x 2 variation columns', () => {
      // Arrange
      const metricKeys = ['a', 'b', 'c']
      const variations = [createVariation('V1', { a: 1, b: 2, c: 3 }), createVariation('V2', { a: 4, b: 5, c: 6 })]
      const props = createDefaultProps({ metricKeys, variations })

      // Act
      render(<MetricsTable {...props} />)

      // Assert — 6 metric inputs (3 keys x 2 variations)
      const inputs = screen.getAllByRole('textbox')
      // 6 metric inputs (3 keys x 2 variations) from DecimalInput (type="text")
      // Plus potentially the "add variation" name input — filter by aria-label pattern
      const metricInputs = inputs.filter((el) => el.getAttribute('aria-label')?.includes(' for '))
      expect(metricInputs.length).toBe(6)
    })

    it('should render mobile card layout with correct CSS class', () => {
      // Arrange
      const variations = [createVariation('V1', { createDevelopment: 1 })]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment'],
        variations
      })

      // Act
      const { container } = render(<MetricsTable {...props} />)

      // Assert — mobile cards container exists
      const mobileCards = container.querySelector('[class*="mobileCards"]')
      expect(mobileCards).toBeInTheDocument()
    })

    it('should render the add variation section', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<MetricsTable {...props} />)

      // Assert
      expect(screen.getByText('+ Add Variation')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Variation name')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Adding a variation
  // -------------------------------------------------------------------------

  describe('adding a variation', () => {
    it('should call onVariationsChange with new variation when Add is clicked', () => {
      // Arrange
      const metricKeys = ['createDevelopment', 'read']
      const props = createDefaultProps({ metricKeys, variations: [] })
      render(<MetricsTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'New Variation' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onVariationsChange).toHaveBeenCalledTimes(1)
      const result = vi.mocked(props.onVariationsChange).mock.calls[0]?.[0] as Array<{
        name: string
        metrics: Record<string, number>
      }>
      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('New Variation')
    })

    it('should initialize new variation with NaN metrics for all keys', () => {
      // Arrange
      const metricKeys = ['a', 'b']
      const props = createDefaultProps({ metricKeys, variations: [] })
      render(<MetricsTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'Test' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      const result = vi.mocked(props.onVariationsChange).mock.calls[0]?.[0] as Array<{
        name: string
        metrics: Record<string, number>
      }>
      expect(Number.isNaN(result[0]?.metrics.a)).toBe(true)
      expect(Number.isNaN(result[0]?.metrics.b)).toBe(true)
    })

    it('should reject empty variation name', () => {
      // Arrange
      const props = createDefaultProps()
      render(<MetricsTable {...props} />)

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onVariationsChange).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toHaveTextContent('Variation name cannot be empty.')
    })

    it('should reject duplicate variation name (case-insensitive)', () => {
      // Arrange
      const variations = [createVariation('CQRS', {})]
      const props = createDefaultProps({ variations })
      render(<MetricsTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Variation name'), {
        target: { value: 'cqrs' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onVariationsChange).not.toHaveBeenCalled()
      expect(screen.getByText('"cqrs" already exists')).toBeInTheDocument()
    })

    it('should clear the name input after adding a variation', () => {
      // Arrange
      const props = createDefaultProps({ variations: [] })
      render(<MetricsTable {...props} />)
      const input = screen.getByPlaceholderText('Variation name')

      // Act
      fireEvent.change(input, { target: { value: 'New' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(input).toHaveValue('')
    })
  })

  // -------------------------------------------------------------------------
  // Removing a variation
  // -------------------------------------------------------------------------

  describe('removing a variation', () => {
    it('should call onVariationsChange without the removed variation', () => {
      // Arrange
      const variations = [
        createVariation('Keep', { createDevelopment: 1 }),
        createVariation('Remove', { createDevelopment: 2 })
      ]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment'],
        variations
      })
      render(<MetricsTable {...props} />)

      // Act
      const [removeButton] = screen.getAllByLabelText('Remove Remove')
      fireEvent.click(removeButton as HTMLElement)

      // Assert
      expect(props.onVariationsChange).toHaveBeenCalledWith([variations[0]])
    })

    it('should produce empty variations array when last variation is removed', () => {
      // Arrange
      const variations = [createVariation('Only', { a: 1 })]
      const props = createDefaultProps({ metricKeys: ['a'], variations })
      render(<MetricsTable {...props} />)

      // Act
      const [removeButton] = screen.getAllByLabelText('Remove Only')
      fireEvent.click(removeButton as HTMLElement)

      // Assert
      expect(props.onVariationsChange).toHaveBeenCalledWith([])
    })
  })

  // -------------------------------------------------------------------------
  // Editing cell values
  // -------------------------------------------------------------------------

  describe('editing cell values', () => {
    it('should call onVariationsChange with updated metric when cell value changes', () => {
      // Arrange
      const variations = [createVariation('V1', { createDevelopment: 1, read: 2 })]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment', 'read'],
        variations
      })
      render(<MetricsTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('createDevelopment for V1'), {
        target: { value: '10' }
      })

      // Assert
      const result = vi.mocked(props.onVariationsChange).mock.calls[0]?.[0] as Array<{
        name: string
        metrics: Record<string, number>
      }>
      expect(result[0]?.metrics.createDevelopment).toBe(10)
    })
  })

  // -------------------------------------------------------------------------
  // Validation warnings
  // -------------------------------------------------------------------------

  describe('validation warnings', () => {
    it('should show validation warnings when metrics are missing', () => {
      // Arrange
      const variations = [createVariation('V1', { createDevelopment: Number.NaN })]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment'],
        variations
      })

      // Act
      render(<MetricsTable {...props} />)

      // Assert
      expect(screen.getByText('V1: createDevelopment is required')).toBeInTheDocument()
    })

    it('should show warning when metric value is 0 or negative', () => {
      // Arrange
      const variations = [createVariation('V1', { createDevelopment: 0 })]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment'],
        variations
      })

      // Act
      render(<MetricsTable {...props} />)

      // Assert
      expect(screen.getByText('V1: createDevelopment must be > 0')).toBeInTheDocument()
    })

    it('should show success panel when all metrics are valid', () => {
      // Arrange
      const variations = [createVariation('V1', { createDevelopment: 5 })]
      const props = createDefaultProps({
        metricKeys: ['createDevelopment'],
        variations
      })

      // Act
      render(<MetricsTable {...props} />)

      // Assert
      expect(screen.getByText(/All values > 0/)).toBeInTheDocument()
    })
  })
})
