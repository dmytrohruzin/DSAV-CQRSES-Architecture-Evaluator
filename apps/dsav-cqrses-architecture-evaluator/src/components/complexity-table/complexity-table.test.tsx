import { afterEach, describe, expect, it, vi } from 'vitest'
import { computeComponentComplexity } from '../../lib/classification/component-complexity'
import type { Component } from '../../lib/classification/types'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { ComplexityTable } from './complexity-table'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createActivity(
  overrides: Partial<{ name: string; designComplexity: number; realizationComplexity: number }> = {}
) {
  return {
    name: 'Test Activity',
    designComplexity: 1,
    realizationComplexity: 2,
    ...overrides
  }
}

function createComponent(overrides: Partial<Component> = {}): Component {
  return {
    name: 'Test Component',
    activities: [createActivity()],
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Default props factory
// ---------------------------------------------------------------------------

function createDefaultProps(overrides: Partial<Parameters<typeof ComplexityTable>[0]> = {}) {
  const base = {
    components: [] as Component[],
    onComponentsChange: vi.fn(),
    designMaxValue: 37,
    realizationMaxValue: 24,
    designWeight: 0.5,
    realizationWeight: 0.5,
    onSettingsChange: vi.fn(),
    onWeightsChange: vi.fn(),
    onAutoCalcMax: vi.fn(),
    ...overrides
  }
  return {
    ...base,
    // Mirror the hook wiring: rows are derived from the same inputs.
    results:
      base.results ??
      computeComponentComplexity(
        base.components,
        { designMaxValue: base.designMaxValue, realizationMaxValue: base.realizationMaxValue },
        { designWeight: base.designWeight, realizationWeight: base.realizationWeight }
      )
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComplexityTable', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('rendering', () => {
    it('should render the classificator settings panel', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByLabelText('Classificator settings:')).toBeInTheDocument()
      expect(screen.getByLabelText('Design Max Value')).toBeInTheDocument()
      expect(screen.getByLabelText('Realization Max Value')).toBeInTheDocument()
    })

    it('should render all component cards when components are provided', () => {
      // Arrange
      const components = [
        createComponent({ name: 'Component A' }),
        createComponent({ name: 'Component B' }),
        createComponent({ name: 'Component C' }),
        createComponent({ name: 'Component D' }),
        createComponent({ name: 'Component E' }),
        createComponent({ name: 'Component F' }),
        createComponent({ name: 'Component G' })
      ]
      const props = createDefaultProps({ components })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      for (const comp of components) {
        expect(screen.getByText(`Component: ${comp.name}`)).toBeInTheDocument()
      }
    })

    it('should render the add component section', () => {
      // Arrange
      const props = createDefaultProps()

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByText('+ Add Component')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Component name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should render activity rows within a component card', () => {
      // Arrange
      const comp = createComponent({
        name: 'My Component',
        activities: [
          createActivity({ name: 'Activity One', designComplexity: 5, realizationComplexity: 3 }),
          createActivity({ name: 'Activity Two', designComplexity: 2, realizationComplexity: 7 })
        ]
      })
      const props = createDefaultProps({ components: [comp] })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByLabelText('Activity name for My Component row 1')).toHaveValue('Activity One')
      expect(screen.getByLabelText('Activity name for My Component row 2')).toHaveValue('Activity Two')
      expect(screen.getByLabelText('Design complexity for Activity One')).toHaveValue('5')
      expect(screen.getByLabelText('Realization complexity for Activity One')).toHaveValue('3')
    })
  })

  // -------------------------------------------------------------------------
  // Adding a component
  // -------------------------------------------------------------------------

  describe('adding a component', () => {
    it('should call onComponentsChange with new component when name is entered and Add is clicked', () => {
      // Arrange
      const props = createDefaultProps({ components: [] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Component name'), {
        target: { value: 'New Component' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([{ name: 'New Component', activities: [] }])
    })

    it('should reject empty component name and not call onComponentsChange', () => {
      // Arrange
      const props = createDefaultProps()
      render(<ComplexityTable {...props} />)

      // Act — submit with empty name
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onComponentsChange).not.toHaveBeenCalled()
    })

    it('should reject whitespace-only component name', () => {
      // Arrange
      const props = createDefaultProps()
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Component name'), {
        target: { value: '   ' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onComponentsChange).not.toHaveBeenCalled()
    })

    it('should trim whitespace from component name before adding', () => {
      // Arrange
      const props = createDefaultProps({ components: [] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Component name'), {
        target: { value: '  Trimmed Name  ' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([{ name: 'Trimmed Name', activities: [] }])
    })

    it('should clear the name input after successfully adding a component', () => {
      // Arrange
      const props = createDefaultProps({ components: [] })
      render(<ComplexityTable {...props} />)
      const input = screen.getByPlaceholderText('Component name')

      // Act
      fireEvent.change(input, { target: { value: 'New Component' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Assert
      expect(input).toHaveValue('')
    })

    it('should submit via form submission (Enter key)', () => {
      // Arrange
      const props = createDefaultProps({ components: [] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByPlaceholderText('Component name'), {
        target: { value: 'Enter Component' }
      })
      fireEvent.submit(screen.getByPlaceholderText('Component name').closest('form') as HTMLFormElement)

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([{ name: 'Enter Component', activities: [] }])
    })
  })

  // -------------------------------------------------------------------------
  // Removing a component
  // -------------------------------------------------------------------------

  describe('removing a component', () => {
    it('should call onComponentsChange without the removed component when x is clicked', () => {
      // Arrange
      const components = [createComponent({ name: 'Keep Me' }), createComponent({ name: 'Remove Me' })]
      const props = createDefaultProps({ components })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.click(screen.getByLabelText('Remove component Remove Me'))

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([components[0]])
    })
  })

  // -------------------------------------------------------------------------
  // Adding an activity
  // -------------------------------------------------------------------------

  describe('adding an activity', () => {
    it('should call onComponentsChange with a new blank activity when + Add Activity is clicked', () => {
      // Arrange
      const comp = createComponent({ name: 'My Comp', activities: [] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.click(screen.getByText('+ Add Activity'))

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([
        {
          name: 'My Comp',
          activities: [{ name: 'New activity', designComplexity: 0, realizationComplexity: 0 }]
        }
      ])
    })
  })

  // -------------------------------------------------------------------------
  // Removing an activity
  // -------------------------------------------------------------------------

  describe('removing an activity', () => {
    it('should call onComponentsChange without the removed activity', () => {
      // Arrange
      const activity1 = createActivity({ name: 'First' })
      const activity2 = createActivity({ name: 'Second' })
      const comp = createComponent({ name: 'Comp', activities: [activity1, activity2] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.click(screen.getByLabelText('Remove activity First'))

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([{ name: 'Comp', activities: [activity2] }])
    })
  })

  // -------------------------------------------------------------------------
  // Editing numeric values
  // -------------------------------------------------------------------------

  describe('editing numeric values', () => {
    it('should call onComponentsChange with updated design complexity when input changes', () => {
      // Arrange
      const activity = createActivity({ name: 'Act', designComplexity: 1, realizationComplexity: 2 })
      const comp = createComponent({ name: 'Comp', activities: [activity] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Design complexity for Act'), {
        target: { value: '10' }
      })

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([
        {
          name: 'Comp',
          activities: [{ name: 'Act', designComplexity: 10, realizationComplexity: 2 }]
        }
      ])
    })

    it('should call onComponentsChange with updated realization complexity when input changes', () => {
      // Arrange
      const activity = createActivity({ name: 'Act', designComplexity: 1, realizationComplexity: 2 })
      const comp = createComponent({ name: 'Comp', activities: [activity] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Realization complexity for Act'), {
        target: { value: '20' }
      })

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([
        {
          name: 'Comp',
          activities: [{ name: 'Act', designComplexity: 1, realizationComplexity: 20 }]
        }
      ])
    })

    it('should not call onComponentsChange when non-numeric value is entered for complexity', () => {
      // Arrange
      const activity = createActivity({ name: 'Act', designComplexity: 5, realizationComplexity: 3 })
      const comp = createComponent({ name: 'Comp', activities: [activity] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act — DecimalInput ignores invalid input (NaN), does not call onChange
      fireEvent.change(screen.getByLabelText('Design complexity for Act'), {
        target: { value: '' }
      })

      // Assert
      expect(props.onComponentsChange).not.toHaveBeenCalled()
    })

    it('should update activity name when activity name input changes', () => {
      // Arrange
      const activity = createActivity({ name: 'Old Name' })
      const comp = createComponent({ name: 'Comp', activities: [activity] })
      const props = createDefaultProps({ components: [comp] })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Activity name for Comp row 1'), {
        target: { value: 'New Name' }
      })

      // Assert
      expect(props.onComponentsChange).toHaveBeenCalledWith([
        {
          name: 'Comp',
          activities: [{ name: 'New Name', designComplexity: 1, realizationComplexity: 2 }]
        }
      ])
    })
  })

  // -------------------------------------------------------------------------
  // Classificator settings
  // -------------------------------------------------------------------------

  describe('classificator settings', () => {
    it('should call onSettingsChange when design max value changes', () => {
      // Arrange
      const props = createDefaultProps({ designMaxValue: 37, realizationMaxValue: 24 })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Design Max Value'), {
        target: { value: '50' }
      })

      // Assert
      expect(props.onSettingsChange).toHaveBeenCalledWith({
        designMaxValue: 50,
        realizationMaxValue: 24
      })
    })

    it('should call onSettingsChange when realization max value changes', () => {
      // Arrange
      const props = createDefaultProps({ designMaxValue: 37, realizationMaxValue: 24 })
      render(<ComplexityTable {...props} />)

      // Act
      fireEvent.change(screen.getByLabelText('Realization Max Value'), {
        target: { value: '30' }
      })

      // Assert
      expect(props.onSettingsChange).toHaveBeenCalledWith({
        designMaxValue: 37,
        realizationMaxValue: 30
      })
    })

    it('should show validation error when design max value is 0 or negative', () => {
      // Arrange
      const props = createDefaultProps({ designMaxValue: 0 })
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByLabelText('Design Max Value')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getAllByText('Must be greater than 0').length).toBeGreaterThanOrEqual(1)
    })

    it('should show validation error when realization max value is 0 or negative', () => {
      // Arrange
      const props = createDefaultProps({ realizationMaxValue: -5 })
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByLabelText('Realization Max Value')).toHaveAttribute('aria-invalid', 'true')
    })

    it('should not call onSettingsChange when NaN is entered', () => {
      // Arrange
      const props = createDefaultProps()
      render(<ComplexityTable {...props} />)

      // Act — DecimalInput ignores invalid input (NaN), does not call onChange
      fireEvent.change(screen.getByLabelText('Design Max Value'), {
        target: { value: 'abc' }
      })

      // Assert
      expect(props.onSettingsChange).not.toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // Classification results display
  // -------------------------------------------------------------------------

  describe('classification results display', () => {
    it('should display fuzzy classification summary when settings are valid', () => {
      // Arrange
      const activity = createActivity({ name: 'Act', designComplexity: 5, realizationComplexity: 3 })
      const comp = createComponent({ name: 'Comp', activities: [activity] })
      const props = createDefaultProps({
        components: [comp],
        designMaxValue: 37,
        realizationMaxValue: 24
      })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.getByText('Class value (fuzzy)')).toBeInTheDocument()
    })

    it('should not display classification summary when design max value is invalid', () => {
      // Arrange
      const comp = createComponent({ name: 'Comp', activities: [createActivity()] })
      const props = createDefaultProps({ components: [comp], designMaxValue: 0 })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.queryByText('Class value (fuzzy)')).not.toBeInTheDocument()
    })

    it('should display error row when an activity value exceeds the axis maximum', () => {
      // Arrange — activity with designComplexity exceeding designMaxValue
      const activity = createActivity({ name: 'Over', designComplexity: 50, realizationComplexity: 1 })
      const comp = createComponent({ name: 'ErrComp', activities: [activity] })
      const props = createDefaultProps({
        components: [comp],
        designMaxValue: 10,
        realizationMaxValue: 10
      })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert — error message should appear in an alert role
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert').textContent).toMatch(/"Over" must be a finite number ≤ 10/)
    })

    it('should display error row for negative activity values', () => {
      const activity = createActivity({ name: 'Neg', designComplexity: -2, realizationComplexity: 1 })
      const comp = createComponent({ name: 'NegComp', activities: [activity] })
      const props = createDefaultProps({ components: [comp] })

      render(<ComplexityTable {...props} />)

      expect(screen.getByRole('alert').textContent).toMatch(/"Neg" must be a finite number ≥ 0/)
    })

    it('should call onAutoCalcMax when the auto-calculate button is clicked', () => {
      const props = createDefaultProps({ components: [createComponent()] })

      render(<ComplexityTable {...props} />)
      fireEvent.click(screen.getByText('Auto-detect from data'))

      expect(props.onAutoCalcMax).toHaveBeenCalledTimes(1)
    })

    it('should not display error row when all activities classify successfully', () => {
      // Arrange — activity with values within maxValue
      const activity = createActivity({ name: 'Ok', designComplexity: 3, realizationComplexity: 2 })
      const comp = createComponent({ name: 'GoodComp', activities: [activity] })
      const props = createDefaultProps({
        components: [comp],
        designMaxValue: 37,
        realizationMaxValue: 24
      })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByText('Class value (fuzzy)')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Details/summary structure
  // -------------------------------------------------------------------------

  describe('details/summary card structure', () => {
    it('should render component cards as details elements that are open by default', () => {
      // Arrange
      const comp = createComponent({ name: 'DetailComp', activities: [] })
      const props = createDefaultProps({ components: [comp] })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert — the details element should be present and open
      const details = document.querySelector('details')
      expect(details).not.toBeNull()
      expect(details?.open).toBe(true)
    })

    it('should render component name inside a summary element', () => {
      // Arrange
      const comp = createComponent({ name: 'SumComp' })
      const props = createDefaultProps({ components: [comp] })

      // Act
      render(<ComplexityTable {...props} />)

      // Assert
      const summary = document.querySelector('summary')
      expect(summary).not.toBeNull()
      expect(summary?.textContent).toContain('SumComp')
    })
  })

  // -------------------------------------------------------------------------
  // Auto-detect from data
  // -------------------------------------------------------------------------
})
