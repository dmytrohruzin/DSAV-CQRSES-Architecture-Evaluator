import { afterEach, describe, expect, it } from 'vitest'
import type { ValidationError } from '../../lib/validation/types'
import { cleanup, render, screen } from '../../test-utils'
import { ValidationStatus } from './validation-status'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function createError(overrides: Partial<ValidationError> = {}): ValidationError {
  return {
    code: 'missing_metric',
    message: 'V1: createDevelopment is required',
    ...overrides
  }
}

function createDefaultProps(overrides: Partial<Parameters<typeof ValidationStatus>[0]> = {}) {
  return {
    errors: [],
    isValid: true,
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ValidationStatus', () => {
  afterEach(() => {
    cleanup()
  })

  // -------------------------------------------------------------------------
  // Valid state
  // -------------------------------------------------------------------------

  describe('valid state', () => {
    it('should show "Validation Passed" heading when isValid is true', () => {
      // Arrange
      const props = createDefaultProps({ isValid: true, errors: [] })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByText('Validation Passed')).toBeInTheDocument()
    })

    it('should show green check success messages when isValid is true', () => {
      // Arrange
      const props = createDefaultProps({ isValid: true, errors: [] })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByText('All metric keys present in all variations')).toBeInTheDocument()
      expect(screen.getByText('All values > 0')).toBeInTheDocument()
      expect(screen.getByText('All required inputs provided')).toBeInTheDocument()
    })

    it('should have aria-label indicating validation passed', () => {
      // Arrange
      const props = createDefaultProps({ isValid: true, errors: [] })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByLabelText('Validation Passed')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Invalid state
  // -------------------------------------------------------------------------

  describe('invalid state', () => {
    it('should show "Validation Errors" heading when isValid is false', () => {
      // Arrange
      const props = createDefaultProps({
        isValid: false,
        errors: [createError()]
      })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByText('Validation Errors')).toBeInTheDocument()
    })

    it('should show all error messages when errors are present', () => {
      // Arrange
      const errors = [
        createError({ code: 'missing_metric', message: 'V1: read is required' }),
        createError({ code: 'invalid_value', message: 'V2: write must be > 0' }),
        createError({ code: 'invalid_swp', message: 'Read + Write must sum to 1.0' })
      ]
      const props = createDefaultProps({ isValid: false, errors })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByText('V1: read is required')).toBeInTheDocument()
      expect(screen.getByText('V2: write must be > 0')).toBeInTheDocument()
      expect(screen.getByText('Read + Write must sum to 1.0')).toBeInTheDocument()
    })

    it('should have aria-label indicating number of errors', () => {
      // Arrange
      const errors = [createError(), createError({ message: 'Another error' })]
      const props = createDefaultProps({ isValid: false, errors })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByLabelText('Validation Errors (2)')).toBeInTheDocument()
    })

    it('should use singular "error" when only one error exists', () => {
      // Arrange
      const props = createDefaultProps({
        isValid: false,
        errors: [createError()]
      })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.getByLabelText('Validation Errors (1)')).toBeInTheDocument()
    })

    it('should not show success messages when isValid is false', () => {
      // Arrange
      const props = createDefaultProps({
        isValid: false,
        errors: [createError()]
      })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      expect(screen.queryByText('All metric keys present in all variations')).not.toBeInTheDocument()
      expect(screen.queryByText('All values > 0')).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  describe('accessibility', () => {
    it('should have aria-live="polite" for dynamic updates', () => {
      // Arrange
      const props = createDefaultProps({ isValid: true })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      const output = screen.getByLabelText('Validation Passed')
      expect(output).toHaveAttribute('aria-live', 'polite')
    })

    it('should use an output element for status reporting', () => {
      // Arrange
      const props = createDefaultProps({ isValid: true })

      // Act
      render(<ValidationStatus {...props} />)

      // Assert
      const output = screen.getByLabelText('Validation Passed')
      expect(output.tagName.toLowerCase()).toBe('output')
    })
  })
})
