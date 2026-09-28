import { describe, expect, it } from 'vitest'
import {
  CLASSICAL_CQRS_LABEL,
  DEFAULT_CLASSICAL_CQRS_COMPONENTS,
  DEFAULT_COMPLEXITY_COMPONENTS,
  DEFAULT_MCQRS_COMPONENTS,
  MCQRS_LABEL
} from './default-complexity-data'

// ---------------------------------------------------------------------------
// Tests — Default Complexity Data
// ---------------------------------------------------------------------------

describe('Default Complexity Data', () => {
  describe('DEFAULT_CLASSICAL_CQRS_COMPONENTS', () => {
    it('should export a non-empty array of components', () => {
      // Assert
      expect(DEFAULT_CLASSICAL_CQRS_COMPONENTS).toBeInstanceOf(Array)
      expect(DEFAULT_CLASSICAL_CQRS_COMPONENTS.length).toBeGreaterThan(0)
    })

    it('should have components with name and activities', () => {
      // Assert
      for (const component of DEFAULT_CLASSICAL_CQRS_COMPONENTS) {
        expect(component.name).toBeTruthy()
        expect(component.activities).toBeInstanceOf(Array)
        expect(component.activities.length).toBeGreaterThan(0)
      }
    })

    it('should have activities with valid numeric complexity values', () => {
      // Assert
      for (const component of DEFAULT_CLASSICAL_CQRS_COMPONENTS) {
        for (const activity of component.activities) {
          expect(activity.name).toBeTruthy()
          expect(typeof activity.designComplexity).toBe('number')
          expect(typeof activity.realizationComplexity).toBe('number')
          expect(activity.designComplexity).toBeGreaterThanOrEqual(0)
          expect(activity.realizationComplexity).toBeGreaterThanOrEqual(0)
        }
      }
    })

    it('should contain 12 components matching the expected categories', () => {
      // Assert
      expect(DEFAULT_CLASSICAL_CQRS_COMPONENTS).toHaveLength(12)
    })
  })

  describe('DEFAULT_MCQRS_COMPONENTS', () => {
    it('should export a non-empty array of components', () => {
      // Assert
      expect(DEFAULT_MCQRS_COMPONENTS).toBeInstanceOf(Array)
      expect(DEFAULT_MCQRS_COMPONENTS.length).toBeGreaterThan(0)
    })

    it('should have components with name and activities', () => {
      // Assert
      for (const component of DEFAULT_MCQRS_COMPONENTS) {
        expect(component.name).toBeTruthy()
        expect(component.activities).toBeInstanceOf(Array)
        expect(component.activities.length).toBeGreaterThan(0)
      }
    })

    it('should have activities with valid numeric complexity values', () => {
      // Assert
      for (const component of DEFAULT_MCQRS_COMPONENTS) {
        for (const activity of component.activities) {
          expect(activity.name).toBeTruthy()
          expect(typeof activity.designComplexity).toBe('number')
          expect(typeof activity.realizationComplexity).toBe('number')
          expect(activity.designComplexity).toBeGreaterThanOrEqual(0)
          expect(activity.realizationComplexity).toBeGreaterThanOrEqual(0)
        }
      }
    })

    it('should contain 12 components matching the expected categories', () => {
      // Assert
      expect(DEFAULT_MCQRS_COMPONENTS).toHaveLength(12)
    })

    it('should have same component names as Classical CQRS', () => {
      // Assert
      const classicalNames = DEFAULT_CLASSICAL_CQRS_COMPONENTS.map((c) => c.name)
      const mcqrsNames = DEFAULT_MCQRS_COMPONENTS.map((c) => c.name)
      expect(mcqrsNames).toEqual(classicalNames)
    })
  })

  describe('DEFAULT_COMPLEXITY_COMPONENTS', () => {
    it('should combine both architectures into a single 24-component list', () => {
      // Assert
      expect(DEFAULT_COMPLEXITY_COMPONENTS).toHaveLength(
        DEFAULT_CLASSICAL_CQRS_COMPONENTS.length + DEFAULT_MCQRS_COMPONENTS.length
      )
    })

    it('should prefix every component name with its architecture label', () => {
      // Assert
      const classicalCount = DEFAULT_COMPLEXITY_COMPONENTS.filter((c) =>
        c.name.startsWith(`${CLASSICAL_CQRS_LABEL} — `)
      ).length
      const mcqrsCount = DEFAULT_COMPLEXITY_COMPONENTS.filter((c) => c.name.startsWith(`${MCQRS_LABEL} — `)).length

      expect(classicalCount).toBe(DEFAULT_CLASSICAL_CQRS_COMPONENTS.length)
      expect(mcqrsCount).toBe(DEFAULT_MCQRS_COMPONENTS.length)
    })

    it('should have unique component names', () => {
      // Arrange
      const names = DEFAULT_COMPLEXITY_COMPONENTS.map((c) => c.name)

      // Assert
      expect(new Set(names).size).toBe(names.length)
    })

    it('should not mutate the source architecture arrays', () => {
      // Assert — prefixing produces fresh objects, leaving the bases unprefixed
      expect(DEFAULT_CLASSICAL_CQRS_COMPONENTS[0]?.name).not.toContain(' — ')
      expect(DEFAULT_MCQRS_COMPONENTS[0]?.name).not.toContain(' — ')
    })
  })
})
