import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PerformanceMetric, PerformanceScale } from '../../lib/performance/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { PerformanceEvaluation } from './performance-evaluation'

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
  Title: 'Title',
  Tooltip: 'Tooltip',
  Legend: 'Legend'
}))

vi.mock('chartjs-plugin-annotation', () => ({
  default: 'annotationPlugin'
}))

// Mock the classificator integration helper
vi.mock('../../lib/classification/classificator', () => ({
  integrate: vi.fn((_fn: unknown, _a: number, _b: number) => 0.5),
  DEFAULT_CLASSIFICATOR_SETTINGS: { designMaxValue: 37, realizationMaxValue: 24 }
}))

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createDefaultScale(): PerformanceScale[] {
  return [
    { threshold: 400, score: 1 },
    { threshold: 350, score: 2 },
    { threshold: 200, score: 3 },
    { threshold: 100, score: 4 },
    { threshold: 50, score: 5 }
  ]
}

function createDefaultMetrics(): PerformanceMetric[] {
  return [
    { name: 'Read', responseTimeMs: 43 },
    { name: 'Write', responseTimeMs: 132 }
  ]
}

function createDefaultProps(overrides: Partial<Parameters<typeof PerformanceEvaluation>[0]> = {}) {
  return {
    scale: createDefaultScale(),
    onScaleChange: vi.fn(),
    metrics: createDefaultMetrics(),
    onMetricsChange: vi.fn(),
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PerformanceEvaluation', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Rendering the default scale
  // -------------------------------------------------------------------------

  describe('rendering', () => {
    it('should render the Performance Scale section heading', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Performance Scale')).toBeInTheDocument()
    })

    it('should render default 5-level scale with threshold and score rows', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — 5 threshold inputs and 5 score inputs
      const thresholdInputs = props.scale.map((_, idx) =>
        screen.getByLabelText(`Level ${idx + 1} threshold in milliseconds`)
      )
      const scoreInputs = props.scale.map((_, idx) => screen.getByLabelText(`Level ${idx + 1} score`))
      expect(thresholdInputs).toHaveLength(5)
      expect(scoreInputs).toHaveLength(5)

      // Verify values
      expect(thresholdInputs[0]).toHaveValue(400)
      expect(thresholdInputs[4]).toHaveValue(50)
      expect(scoreInputs[0]).toHaveValue(1)
      expect(scoreInputs[4]).toHaveValue(5)
    })

    it('should render Performance Results section with metrics table', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Performance Results')).toBeInTheDocument()
      expect(screen.getByText('Read')).toBeInTheDocument()
      expect(screen.getByText('Write')).toBeInTheDocument()
    })

    it('should render metric response time inputs with correct values', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByLabelText('Read response time in milliseconds')).toHaveValue(43)
      expect(screen.getByLabelText('Write response time in milliseconds')).toHaveValue(132)
    })

    it('should render the Performance Chart section', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Performance Chart')).toBeInTheDocument()
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument()
    })

    it('should render + Add Level and Remove Last buttons', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('+ Add Level')).toBeInTheDocument()
      expect(screen.getByText('Remove Last')).toBeInTheDocument()
    })

    it('should render the add performance metric button', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByRole('button', { name: '+ Add Performance Metric' })).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Editing response times (via metrics)
  // -------------------------------------------------------------------------

  describe('editing response times', () => {
    it('should call onMetricsChange when Read metric response time changes', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Read response time in milliseconds'), {
        target: { value: '100' }
      })

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([
        { name: 'Read', responseTimeMs: 100 },
        { name: 'Write', responseTimeMs: 132 }
      ])
    })

    it('should call onMetricsChange when Write metric response time changes', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Write response time in milliseconds'), {
        target: { value: '200' }
      })

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([
        { name: 'Read', responseTimeMs: 43 },
        { name: 'Write', responseTimeMs: 200 }
      ])
    })

    it('should not call onMetricsChange when NaN is entered', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Read response time in milliseconds'), {
        target: { value: 'abc' }
      })

      // Assert
      expect(props.onMetricsChange).not.toHaveBeenCalled()
    })

    it('should clamp negative response time value to 0', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Read response time in milliseconds'), {
        target: { value: '-10' }
      })

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([
        { name: 'Read', responseTimeMs: 0 },
        { name: 'Write', responseTimeMs: 132 }
      ])
    })
  })

  // -------------------------------------------------------------------------
  // Adding / removing metrics
  // -------------------------------------------------------------------------

  describe('adding and removing metrics', () => {
    it('should add a new metric when name is entered and Add button is clicked', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Metric name'), {
        target: { value: 'Delete' }
      })
      fireEvent.click(screen.getByRole('button', { name: '+ Add Performance Metric' }))

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([
        { name: 'Read', responseTimeMs: 43 },
        { name: 'Write', responseTimeMs: 132 },
        { name: 'Delete', responseTimeMs: 0 }
      ])
    })

    it('should not add a metric when name is empty', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.click(screen.getByRole('button', { name: '+ Add Performance Metric' }))

      // Assert
      expect(props.onMetricsChange).not.toHaveBeenCalled()
    })

    it('should add a metric on Enter key press', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      const input = screen.getByPlaceholderText('Metric name')
      fireEvent.change(input, { target: { value: 'Latency' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([
        { name: 'Read', responseTimeMs: 43 },
        { name: 'Write', responseTimeMs: 132 },
        { name: 'Latency', responseTimeMs: 0 }
      ])
    })

    it('should remove a metric when its remove button is clicked', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.click(screen.getByLabelText('Remove metric: Read'))

      // Assert
      expect(props.onMetricsChange).toHaveBeenCalledWith([{ name: 'Write', responseTimeMs: 132 }])
    })

    it('should show empty state when no metrics exist', () => {
      // Arrange
      const props = createDefaultProps({ metrics: [] })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — empty row text and add button both present
      expect(screen.getAllByText('+ Add Performance Metric')).toHaveLength(2)
    })
  })

  // -------------------------------------------------------------------------
  // Editing scale thresholds and scores
  // -------------------------------------------------------------------------

  describe('editing scale values', () => {
    it('should call onScaleChange with updated threshold when threshold input changes', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Level 1 threshold in milliseconds'), {
        target: { value: '500' }
      })

      // Assert
      const expectedScale = [...createDefaultScale()]
      expectedScale[0] = { threshold: 500, score: 1 }
      expect(props.onScaleChange).toHaveBeenCalledWith(expectedScale)
    })

    it('should call onScaleChange with updated score when score input changes', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Level 3 score'), {
        target: { value: '10' }
      })

      // Assert
      const expectedScale = [...createDefaultScale()]
      expectedScale[2] = { threshold: 200, score: 10 }
      expect(props.onScaleChange).toHaveBeenCalledWith(expectedScale)
    })

    it('should clamp negative threshold to 0', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Level 1 threshold in milliseconds'), {
        target: { value: '-100' }
      })

      // Assert
      const expectedScale = [...createDefaultScale()]
      expectedScale[0] = { threshold: 0, score: 1 }
      expect(props.onScaleChange).toHaveBeenCalledWith(expectedScale)
    })

    it('should not call onScaleChange when NaN is entered for threshold', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Level 1 threshold in milliseconds'), {
        target: { value: 'abc' }
      })

      // Assert
      expect(props.onScaleChange).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // Adding / removing scale levels
  // -------------------------------------------------------------------------

  describe('adding and removing scale levels', () => {
    it('should call onScaleChange with a new level appended when + Add Level is clicked', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.click(screen.getByText('+ Add Level'))

      // Assert — new level uses half of last threshold, score incremented
      const lastItem = createDefaultScale()[4] as PerformanceScale
      expect(props.onScaleChange).toHaveBeenCalledWith([
        ...createDefaultScale(),
        { threshold: Math.max(1, Math.round(lastItem.threshold / 2)), score: lastItem.score + 1 }
      ])
    })

    it('should call onScaleChange with last level removed when Remove Last is clicked', () => {
      // Arrange
      const props = createDefaultProps()
      render(<PerformanceEvaluation {...props} />)

      // Act
      fireEvent.click(screen.getByText('Remove Last'))

      // Assert
      expect(props.onScaleChange).toHaveBeenCalledWith(createDefaultScale().slice(0, 4))
    })

    it('should disable Remove Last button when only 1 level remains', () => {
      // Arrange
      const singleLevel: PerformanceScale[] = [{ threshold: 100, score: 5 }]
      const props = createDefaultProps({ scale: singleLevel })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Remove Last')).toBeDisabled()
    })

    it('should not disable Remove Last button when more than 1 level exists', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Remove Last')).not.toBeDisabled()
    })
  })

  // -------------------------------------------------------------------------
  // Performance results display
  // -------------------------------------------------------------------------

  describe('performance results display', () => {
    it('should display score values in the results table', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — scores are displayed with .toFixed(2)
      const scoreElements = screen.getAllByText(/^\d+\.\d{2}$/)
      expect(scoreElements.length).toBe(2)
    })

    it('should display calculation descriptions in the results table', () => {
      // Arrange — readMs=43 falls below 50 (lowest threshold) → pure class formula
      const props = createDefaultProps()

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — describeClass outputs "1 × 5 = 5.00" for value below lowest threshold
      expect(screen.getByText(/1 × 5 = 5\.00/)).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Chart with fewer than 2 levels
  // -------------------------------------------------------------------------

  describe('chart with insufficient levels', () => {
    it('should show fallback message when scale has fewer than 2 levels', () => {
      // Arrange
      const props = createDefaultProps({
        scale: [{ threshold: 100, score: 5 }]
      })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByText('Add at least 2 scale levels to display the chart.')).toBeInTheDocument()
      expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Fuzzy scoring branches (value above/below thresholds)
  // -------------------------------------------------------------------------

  describe('fuzzy scoring edge cases', () => {
    it('should display pure class formula when metric value exceeds highest threshold', () => {
      // Arrange — 500 exceeds 400 (highest threshold) → pure class: "1 × 1 = 1.00"
      const props = createDefaultProps({
        metrics: [
          { name: 'Read', responseTimeMs: 500 },
          { name: 'Write', responseTimeMs: 10 }
        ]
      })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — score 1 is for the highest threshold (400)
      expect(screen.getByText(/1 × 1 = 1\.00/)).toBeInTheDocument()
    })

    it('should display pure class formula when metric value is below lowest threshold', () => {
      // Arrange — 10 is below 50 (lowest threshold) → pure class: "1 × 5 = 5.00"
      const props = createDefaultProps({
        metrics: [
          { name: 'Read', responseTimeMs: 10 },
          { name: 'Write', responseTimeMs: 500 }
        ]
      })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — score 5 is for the lowest threshold (50)
      expect(screen.getByText(/1 × 5 = 5\.00/)).toBeInTheDocument()
    })

    it('should display weighted formula when value is between two thresholds', () => {
      // Arrange — 250 is between 200 (score 3) and 350 (score 2)
      const props = createDefaultProps({
        metrics: [
          { name: 'Read', responseTimeMs: 250 },
          { name: 'Write', responseTimeMs: 10 }
        ]
      })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — weighted formula: "3 × wL + 2 × wU = result"
      // With mocked integrate returning 0.5, partLower = partUpper → equal weights
      expect(screen.getByText(/3 × 0\.50 \+ 2 × 0\.50 = 2\.50/)).toBeInTheDocument()
    })

    it('should render with empty scale without crashing', () => {
      // Arrange
      const props = createDefaultProps({
        scale: [],
        metrics: [
          { name: 'Read', responseTimeMs: 100 },
          { name: 'Write', responseTimeMs: 200 }
        ]
      })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert — component renders; both scores default to 0
      const zeroScores = screen.getAllByText('0.00')
      expect(zeroScores).toHaveLength(2)
    })

    it('should render with two-level scale and chart', () => {
      // Arrange — minimal scale that still shows chart
      const scale: PerformanceScale[] = [
        { threshold: 200, score: 1 },
        { threshold: 50, score: 5 }
      ]
      const props = createDefaultProps({ scale })

      // Act
      render(<PerformanceEvaluation {...props} />)

      // Assert
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument()
    })
  })
})
