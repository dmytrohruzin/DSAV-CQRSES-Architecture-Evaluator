import { describe, expect, it } from 'vitest'
import { classify, DEFAULT_CLASSIFICATOR_SETTINGS, integrate } from './classificator'

// ---------------------------------------------------------------------------
// Constants derived from the classificator internals
// ---------------------------------------------------------------------------

// 5 classes => chunksCount = 5 * 2 - 1 = 9
const CLASSES_COUNT = 5
const CHUNKS_COUNT = CLASSES_COUNT * 2 - 1 // 9

const CLASS_VALUES = {
  verySimple: 4,
  simple: 6,
  average: 8,
  complex: 12,
  veryComplex: 16
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute the chunk size for a given maxValue. */
function chunkSize(maxValue: number): number {
  return maxValue / CHUNKS_COUNT
}

/** Compute the center of the pure zone for class index `i`. */
function pureZoneCenter(maxValue: number, classIndex: number): number {
  const chunk = chunkSize(maxValue)
  return (2 * classIndex + 0.5) * chunk
}

/** Compute the midpoint of the transition zone between class `i` and `i+1`. */
function transitionMidpoint(maxValue: number, classIndex: number): number {
  const chunk = chunkSize(maxValue)
  return (2 * classIndex + 1.5) * chunk
}

// ---------------------------------------------------------------------------
// 1. integrate — numerical integration (trapezoidal rule)
// ---------------------------------------------------------------------------

describe('integrate', () => {
  it('should compute the integral of a constant function', () => {
    // Arrange
    const constantFn = (_x: number) => 1

    // Act
    const result = integrate(constantFn, 0, 5)

    // Assert — integral of 1 over [0,5] = 5
    expect(result).toBeCloseTo(5, 10)
  })

  it('should compute the integral of a linear function f(x) = x', () => {
    // Arrange
    const linearFn = (x: number) => x

    // Act
    const result = integrate(linearFn, 0, 1)

    // Assert — integral of x over [0,1] = 0.5
    expect(result).toBeCloseTo(0.5, 6)
  })

  it('should compute the integral of f(x) = x^2', () => {
    // Arrange
    const quadraticFn = (x: number) => x * x

    // Act
    const result = integrate(quadraticFn, 0, 1)

    // Assert — integral of x^2 over [0,1] = 1/3
    expect(result).toBeCloseTo(1 / 3, 4)
  })

  it('should return 0 when integrating over a zero-width interval', () => {
    // Arrange
    const fn = (x: number) => x + 1

    // Act
    const result = integrate(fn, 3, 3)

    // Assert
    expect(result).toBeCloseTo(0, 10)
  })

  it('should produce a negative result for reversed bounds', () => {
    // Arrange
    const linearFn = (x: number) => x

    // Act
    const result = integrate(linearFn, 1, 0)

    // Assert — reversed bounds effectively negate the integral
    expect(result).toBeCloseTo(-0.5, 4)
  })

  it('should use the custom n parameter for sub-intervals', () => {
    // Arrange
    const linearFn = (x: number) => x

    // Act — even with very few sub-intervals, trapezoidal is exact for linear
    const result = integrate(linearFn, 0, 1, 2)

    // Assert
    expect(result).toBeCloseTo(0.5, 10)
  })
})

// ---------------------------------------------------------------------------
// 2. DEFAULT_CLASSIFICATOR_SETTINGS
// ---------------------------------------------------------------------------

describe('DEFAULT_CLASSIFICATOR_SETTINGS', () => {
  it('should have designMaxValue of 30', () => {
    expect(DEFAULT_CLASSIFICATOR_SETTINGS.designMaxValue).toBe(30)
  })

  it('should have realizationMaxValue of 37', () => {
    expect(DEFAULT_CLASSIFICATOR_SETTINGS.realizationMaxValue).toBe(37)
  })
})

// ---------------------------------------------------------------------------
// 3. classify — pure zone tests (value falls entirely within one class)
// ---------------------------------------------------------------------------

describe('classify', () => {
  describe('pure zones — value maps to a single class', () => {
    const maxValue = 37
    const _chunk = chunkSize(maxValue) // 37/9 ≈ 4.1111

    it('should return "very simple" (4) for value at the start of the axis (0)', () => {
      // Arrange — value = 0, inside pure zone of class 0 [0, chunk]
      const value = 0

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.verySimple)
    })

    it('should return "very simple" (4) for value at the center of class 0 pure zone', () => {
      // Arrange
      const value = pureZoneCenter(maxValue, 0)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.verySimple)
    })

    it('should return "simple" (6) for value in the center of class 1 pure zone', () => {
      // Arrange
      const value = pureZoneCenter(maxValue, 1)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.simple)
    })

    it('should return "average" (8) for value in the center of class 2 pure zone', () => {
      // Arrange
      const value = pureZoneCenter(maxValue, 2)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.average)
    })

    it('should return "complex" (12) for value in the center of class 3 pure zone', () => {
      // Arrange
      const value = pureZoneCenter(maxValue, 3)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.complex)
    })

    it('should return "very complex" (16) for value in the center of class 4 pure zone', () => {
      // Arrange
      const value = pureZoneCenter(maxValue, 4)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should return "very complex" (16) for value at maxValue (upper boundary of last pure zone)', () => {
      // Arrange — value = maxValue = (2*4+1)*chunk = 9*chunk = 37
      const value = maxValue

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should return "average" (8) for Create (Development) design sum of 18', () => {
      // Arrange — sum of designComplexity for Create (Development): 2+4+1+3+6+2 = 18
      // chunk = 37/9 ≈ 4.111, class 2 pure zone: [4*chunk, 5*chunk] = [16.44, 20.56]
      // 18 is within this range
      const value = 18

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.average)
    })
  })

  // ---------------------------------------------------------------------------
  // 4. classify — transition zone tests (value between two classes)
  // ---------------------------------------------------------------------------

  describe('transition zones — value produces a weighted combination', () => {
    const maxValue = 37
    const chunk = chunkSize(maxValue) // 37/9

    it('should return a value between "very simple" (4) and "simple" (6) in transition zone 0→1', () => {
      // Arrange — midpoint of transition zone between class 0 and class 1
      const value = transitionMidpoint(maxValue, 0)

      // Act
      const result = classify(value, maxValue)

      // Assert — must be between the two class values
      expect(result).toBeGreaterThan(CLASS_VALUES.verySimple)
      expect(result).toBeLessThan(CLASS_VALUES.simple)
    })

    it('should return a value between "simple" (6) and "average" (8) in transition zone 1→2', () => {
      // Arrange
      const value = transitionMidpoint(maxValue, 1)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBeGreaterThan(CLASS_VALUES.simple)
      expect(result).toBeLessThan(CLASS_VALUES.average)
    })

    it('should return a value between "average" (8) and "complex" (12) in transition zone 2→3', () => {
      // Arrange
      const value = transitionMidpoint(maxValue, 2)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBeGreaterThan(CLASS_VALUES.average)
      expect(result).toBeLessThan(CLASS_VALUES.complex)
    })

    it('should return a value between "complex" (12) and "very complex" (16) in transition zone 3→4', () => {
      // Arrange
      const value = transitionMidpoint(maxValue, 3)

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBeGreaterThan(CLASS_VALUES.complex)
      expect(result).toBeLessThan(CLASS_VALUES.veryComplex)
    })

    it('should approach the lower class value near the start of a transition zone', () => {
      // Arrange — just past the pure zone boundary of class 0
      const epsilon = chunk * 0.01
      const value = chunk + epsilon // just past pure zone end

      // Act
      const result = classify(value, maxValue)

      // Assert — should be very close to class 0 value (4)
      expect(result).toBeGreaterThanOrEqual(CLASS_VALUES.verySimple)
      expect(result).toBeLessThan(CLASS_VALUES.verySimple + 0.5)
    })

    it('should approach the upper class value near the end of a transition zone', () => {
      // Arrange — just before the pure zone boundary of class 1
      const epsilon = chunk * 0.01
      const value = 2 * chunk - epsilon // just before class 1 pure zone

      // Act
      const result = classify(value, maxValue)

      // Assert — should be close to class 1 value (6)
      expect(result).toBeGreaterThan(CLASS_VALUES.simple - 0.5)
      expect(result).toBeLessThanOrEqual(CLASS_VALUES.simple)
    })
  })

  // ---------------------------------------------------------------------------
  // 5. classify — with real component data from default-complexity-data
  // ---------------------------------------------------------------------------

  describe('real component data from default dataset', () => {
    it('should classify Create (Development) design sum correctly with designMaxValue=30', () => {
      // Arrange — Create (Development) designComplexity: 6+4+1+3+10+4 = 28
      // designMaxValue=30, chunk = 30/9 ≈ 3.333
      // class 4 pure zone: [8*chunk, 9*chunk] = [26.667, 30]; 28 is in pure zone
      const designSum = 6 + 4 + 1 + 3 + 10 + 4 // = 28
      const maxValue = DEFAULT_CLASSIFICATOR_SETTINGS.designMaxValue

      // Act
      const result = classify(designSum, maxValue)

      // Assert — falls in "very complex" pure zone with designMaxValue=30
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should classify Create (Development) realization sum correctly with realizationMaxValue=37', () => {
      // Arrange — Create (Development) realizationComplexity: 3.67+3.5+1.83+13.67+7+2.17 = 31.84
      // realizationMaxValue=37, chunk = 37/9 ≈ 4.111
      // class 3 pure zone: [24.667, 28.778]; transition 3->4: (28.778, 32.889)
      // 31.84 falls in transition zone between class 3 and class 4
      const realizationSum = 3.67 + 3.5 + 1.83 + 13.67 + 7 + 2.17
      const maxValue = DEFAULT_CLASSIFICATOR_SETTINGS.realizationMaxValue

      // Act
      const result = classify(realizationSum, maxValue)

      // Assert — between "complex" (12) and "very complex" (16)
      expect(result).toBeGreaterThan(CLASS_VALUES.complex)
      expect(result).toBeLessThan(CLASS_VALUES.veryComplex)
    })

    it('should classify Eventual Consistency (Modification) design sum correctly', () => {
      // Arrange — designComplexity: 1+5+2 = 8
      // designMaxValue=30, chunk = 30/9 ≈ 3.333
      // class 1 pure zone: [6.667, 10.0]; 8 falls in class 1 pure zone
      const designSum = 1 + 5 + 2 // = 8
      const maxValue = DEFAULT_CLASSIFICATOR_SETTINGS.designMaxValue

      // Act
      const result = classify(designSum, maxValue)

      // Assert — falls in "simple" pure zone with designMaxValue=30
      expect(result).toBe(CLASS_VALUES.simple)
    })

    it('should classify Query (Development) design sum correctly', () => {
      // Arrange — designComplexity: 6+4+8+2 = 20
      // designMaxValue=30, chunk = 30/9 ≈ 3.333
      // class 3 pure zone: [20.0, 23.333]; 20 is in pure zone
      const designSum = 6 + 4 + 8 + 2 // = 20
      const maxValue = DEFAULT_CLASSIFICATOR_SETTINGS.designMaxValue

      // Act
      const result = classify(designSum, maxValue)

      // Assert — falls in "complex" (12) with designMaxValue=30
      expect(result).toBe(CLASS_VALUES.complex)
    })
  })

  // ---------------------------------------------------------------------------
  // 6. classify — custom maxValue
  // ---------------------------------------------------------------------------

  describe('custom maxValue', () => {
    it('should classify correctly with a small maxValue', () => {
      // Arrange — maxValue=9 means chunk=1, pure zone for class 0: [0, 1]
      const maxValue = 9
      const value = 0.5

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.verySimple)
    })

    it('should classify correctly with a large maxValue', () => {
      // Arrange — maxValue=900, chunk=100, pure zone for class 4: [800, 900]
      const maxValue = 900
      const value = 850

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should produce the same class for proportionally scaled values', () => {
      // Arrange — value at center of class 2 pure zone for two different maxValues
      const result1 = classify(pureZoneCenter(37, 2), 37)
      const result2 = classify(pureZoneCenter(100, 2), 100)

      // Assert — both should return "average" (8)
      expect(result1).toBe(CLASS_VALUES.average)
      expect(result2).toBe(CLASS_VALUES.average)
    })
  })

  // ---------------------------------------------------------------------------
  // 7. classify — boundary values
  // ---------------------------------------------------------------------------

  describe('boundary values', () => {
    it('should return "very simple" (4) for value exactly at 0', () => {
      // Arrange & Act
      const result = classify(0, 37)

      // Assert
      expect(result).toBe(CLASS_VALUES.verySimple)
    })

    it('should return "very complex" (16) for value exactly at maxValue', () => {
      // Arrange & Act
      const result = classify(37, 37)

      // Assert
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should classify value at exact pure zone boundary (upper edge)', () => {
      // Arrange — value = chunk (upper boundary of class 0 pure zone)
      const maxValue = 37
      const chunk = chunkSize(maxValue)
      const value = chunk // exact boundary

      // Act
      const result = classify(value, maxValue)

      // Assert — boundary is inclusive for pure zone: 2*0*chunk <= value <= (2*0+1)*chunk
      expect(result).toBe(CLASS_VALUES.verySimple)
    })

    it('should classify value at exact pure zone boundary (lower edge of class 1)', () => {
      // Arrange — value = 2*chunk (lower boundary of class 1 pure zone)
      const maxValue = 37
      const chunk = chunkSize(maxValue)
      const value = 2 * chunk

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.simple)
    })
  })

  // ---------------------------------------------------------------------------
  // 8. classify — invalid input cases (never throws, returns null)
  // ---------------------------------------------------------------------------

  describe('invalid input cases', () => {
    it('should return null when value exceeds maxValue', () => {
      expect(classify(38, 37)).toBeNull()
    })

    it('should return null when value is significantly above maxValue', () => {
      expect(classify(100, 37)).toBeNull()
    })

    it('should return null for non-finite values', () => {
      expect(classify(Number.NaN, 37)).toBeNull()
      expect(classify(Number.POSITIVE_INFINITY, 37)).toBeNull()
      expect(classify(5, Number.NaN)).toBeNull()
    })

    it('should return null when maxValue is zero or negative', () => {
      expect(classify(0, 0)).toBeNull()
      expect(classify(1, -5)).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // 9. classify — edge cases with unusual maxValue
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('should handle very small maxValue (chunk becomes tiny)', () => {
      // Arrange — maxValue=0.9, chunk=0.1, class 4 pure zone: [0.8, 0.9]
      const maxValue = 0.9
      const value = 0.85

      // Act
      const result = classify(value, maxValue)

      // Assert
      expect(result).toBe(CLASS_VALUES.veryComplex)
    })

    it('should handle a value of exactly 0 with any positive maxValue', () => {
      // Arrange & Act
      const result1 = classify(0, 1)
      const result2 = classify(0, 100)
      const result3 = classify(0, 0.5)

      // Assert — 0 always falls in the first pure zone
      expect(result1).toBe(CLASS_VALUES.verySimple)
      expect(result2).toBe(CLASS_VALUES.verySimple)
      expect(result3).toBe(CLASS_VALUES.verySimple)
    })

    it('should return null for a negative value (falls outside all zones)', () => {
      expect(classify(-1, 37)).toBeNull()
    })

    it('should produce consistent results across all transition zones', () => {
      // Arrange — test all 4 transition zones
      const maxValue = 37

      // Act
      const results = [0, 1, 2, 3].map((i) => classify(transitionMidpoint(maxValue, i), maxValue))

      // Assert — each transition result is between its neighboring class values
      const classPairs = [
        [CLASS_VALUES.verySimple, CLASS_VALUES.simple],
        [CLASS_VALUES.simple, CLASS_VALUES.average],
        [CLASS_VALUES.average, CLASS_VALUES.complex],
        [CLASS_VALUES.complex, CLASS_VALUES.veryComplex]
      ]

      results.forEach((result, idx) => {
        const [lower, upper] = classPairs[idx] as [number, number]
        expect(result).toBeGreaterThan(lower)
        expect(result).toBeLessThan(upper)
      })
    })

    it('should be monotonically non-decreasing as value increases within the axis', () => {
      // Arrange — sample values across the full range
      const maxValue = 37
      const step = maxValue / 50
      const values: number[] = []

      for (let v = 0; v <= maxValue; v += step) {
        values.push(v)
      }
      values.push(maxValue) // ensure we include the endpoint

      // Act
      const results = values.map((v) => classify(v, maxValue))

      // Assert — each result is >= the previous one
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i - 1] as number)
      }
    })
  })
})
