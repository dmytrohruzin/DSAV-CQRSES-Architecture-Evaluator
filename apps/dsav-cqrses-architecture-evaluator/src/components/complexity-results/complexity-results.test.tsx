import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '../../test-utils'
import { ComplexityResults } from './complexity-results'

// ---------------------------------------------------------------------------
// Mock Chart.js and react-chartjs-2 — canvas is not available in jsdom
// ---------------------------------------------------------------------------

vi.mock('react-chartjs-2', () => ({
  Line: (props: Record<string, unknown>) => (
    <div data-testid="mock-line-chart" data-options={JSON.stringify(props.options)} />
  )
}))

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: 'CategoryScale',
  LinearScale: 'LinearScale',
  PointElement: 'PointElement',
  LineElement: 'LineElement',
  Filler: 'Filler',
  Tooltip: 'Tooltip',
  Legend: 'Legend'
}))

vi.mock('chartjs-plugin-annotation', () => ({
  default: 'annotationPlugin'
}))

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createResult(
  overrides: Partial<{ name: string; designClass: number; realizationClass: number; total: number }> = {}
) {
  return {
    name: 'Component A',
    designClass: 4.0,
    realizationClass: 6.0,
    total: 5.0,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function createDefaultProps(overrides: Partial<Parameters<typeof ComplexityResults>[0]> = {}) {
  return {
    results: [],
    designMaxValue: 37,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComplexityResults', () => {
  afterEach(() => {
    cleanup()
  })

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  describe('empty state', () => {
    it('should show placeholder when results are empty', () => {
      // Arrange
      const props = createDefaultProps({ results: [] })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      expect(
        screen.getByText('No results to display. Add components and activities to see complexity results.')
      ).toBeInTheDocument()
    })

    it('should render the section heading even when empty', () => {
      // Arrange
      const props = createDefaultProps({ results: [] })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      expect(screen.getByText('Complexity Results')).toBeInTheDocument()
    })

    it('should not render the chart when results are empty', () => {
      // Arrange
      const props = createDefaultProps({ results: [] })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Results table rendering
  // -------------------------------------------------------------------------

  describe('results table', () => {
    it('should render results table with correct column headers', () => {
      // Arrange
      const props = createDefaultProps({
        results: [createResult()]
      })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      const table = screen.getByRole('table', { name: 'Complexity Results' })
      expect(within(table).getByText('Component')).toBeInTheDocument()
      expect(within(table).getByText('Design')).toBeInTheDocument()
      expect(within(table).getByText('Realization')).toBeInTheDocument()
      expect(within(table).getByText('Refined')).toBeInTheDocument()
    })

    it('should render a row for each result with formatted values', () => {
      // Arrange
      const results = [
        createResult({ name: 'Comp A', designClass: 4.123, realizationClass: 6.456, total: 5.29 }),
        createResult({ name: 'Comp B', designClass: 8.0, realizationClass: 12.0, total: 10.0 })
      ]
      const props = createDefaultProps({ results })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      const table = screen.getByRole('table', { name: 'Complexity Results' })
      expect(within(table).getByText('Comp A')).toBeInTheDocument()
      expect(within(table).getByText('4.12')).toBeInTheDocument()
      expect(within(table).getByText('6.46')).toBeInTheDocument()
      expect(within(table).getByText('5.29')).toBeInTheDocument()
      expect(within(table).getByText('Comp B')).toBeInTheDocument()
      expect(within(table).getByText('8.00')).toBeInTheDocument()
      expect(within(table).getByText('12.00')).toBeInTheDocument()
      expect(within(table).getByText('10.00')).toBeInTheDocument()
    })

    it('should not render a grand total row in the results table', () => {
      // Arrange
      const results = [
        createResult({ name: 'Comp A', designClass: 4.0, realizationClass: 6.0, total: 5.0 }),
        createResult({ name: 'Comp B', designClass: 8.0, realizationClass: 12.0, total: 10.0 }),
        createResult({ name: 'Comp C', designClass: 16.0, realizationClass: 4.0, total: 10.0 })
      ]
      const props = createDefaultProps({ results })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert — no total row; only header + 3 data rows = 4 rows
      const table = screen.getByRole('table', { name: 'Complexity Results' })
      const rows = within(table).getAllByRole('row')
      expect(rows).toHaveLength(4) // 1 header + 3 data rows
      // Last row should be the last data row, not a total row
      const lastRow = rows[rows.length - 1] as HTMLElement
      expect(within(lastRow).getByText('Comp C')).toBeInTheDocument()
    })

    it('should render correct totals for a single component', () => {
      // Arrange
      const results = [createResult({ name: 'Only', designClass: 7.5, realizationClass: 3.25, total: 5.375 })]
      const props = createDefaultProps({ results })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      const table = screen.getByRole('table', { name: 'Complexity Results' })
      const rows = within(table).getAllByRole('row')
      const totalRow = rows[rows.length - 1] as HTMLElement
      expect(within(totalRow).getByText('7.50')).toBeInTheDocument()
      expect(within(totalRow).getByText('3.25')).toBeInTheDocument()
      expect(within(totalRow).getByText('5.38')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Chart rendering
  // -------------------------------------------------------------------------

  describe('chart', () => {
    it('should render the complexity chart section when results are present', () => {
      // Arrange
      const props = createDefaultProps({
        results: [createResult()]
      })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      expect(screen.getByText('Complexity Chart')).toBeInTheDocument()
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument()
    })

    it('should render both the table and chart sections', () => {
      // Arrange
      const props = createDefaultProps({
        results: [createResult()]
      })

      // Act
      render(<ComplexityResults {...props} />)

      // Assert
      expect(screen.getByText('Complexity Results')).toBeInTheDocument()
      expect(screen.getByText('Complexity Chart')).toBeInTheDocument()
    })
  })
})
