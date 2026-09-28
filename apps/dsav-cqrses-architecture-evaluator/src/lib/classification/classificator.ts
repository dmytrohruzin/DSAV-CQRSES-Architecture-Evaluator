// =============================================================================
// Fuzzy-logic classificator — TypeScript port of classificator.js
// =============================================================================
// Classifies a numeric value into one of 5 complexity classes using
// trapezoid membership functions and numerical integration.

import type { ClassificatorSettings } from './types'

// ---------------------------------------------------------------------------
// Complexity classes
// ---------------------------------------------------------------------------

interface ComplexityClass {
  name: string
  value: number
}

const classes: readonly ComplexityClass[] = [
  { name: 'very simple', value: 4 },
  { name: 'simple', value: 6 },
  { name: 'average', value: 8 },
  { name: 'complex', value: 12 },
  { name: 'very complex', value: 16 }
] as const

// ---------------------------------------------------------------------------
// Numerical integration (trapezoidal rule)
// ---------------------------------------------------------------------------

/** Default sub-interval count for the trapezoidal integration. */
const INTEGRATION_STEPS = 1000

/** Membership weights are rounded to whole percent before combining. */
const MEMBERSHIP_PERCENT_SCALE = 100

/**
 * Approximate the definite integral of `func` over [a, b] using the
 * trapezoidal rule with `n` sub-intervals.
 */
export const integrate = (func: (x: number) => number, a: number, b: number, n: number = INTEGRATION_STEPS): number => {
  const h = (b - a) / n
  let sum = 0.5 * (func(a) + func(b))

  for (let i = 1; i < n; i += 1) {
    sum += func(a + i * h)
  }

  return sum * h
}

// ---------------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------------

// Axis maximums match the largest activity value in `DEFAULT_COMPLEXITY_COMPONENTS`
// (design 30 — Classical CQRS "Отримання агрегату"; realization 36.43 — "Побудова
// проєкції"), rounded up, so every default activity stays on the axis.
export const DEFAULT_CLASSIFICATOR_SETTINGS: ClassificatorSettings = {
  designMaxValue: 30,
  realizationMaxValue: 37
}

// ---------------------------------------------------------------------------
// Core classification
// ---------------------------------------------------------------------------

/**
 * Classify a single value against a fuzzy-logic axis.
 *
 * The axis `[0, maxValue]` is split into `2 * classCount - 1` equal chunks.
 * Each class owns one "pure" chunk and one "transition" chunk (shared with
 * the next class). In the transition zone a weighted combination of the two
 * neighbouring class values is returned using trapezoid membership areas
 * computed via numerical integration.
 *
 * @param value   — sum of activity complexity values
 * @param maxValue — axis maximum (e.g. `designMaxValue` or `realizationMaxValue`)
 * @returns the fuzzy class value (weighted combination), or `null` for
 *   invalid input: non-finite values, `value < 0`, `maxValue ≤ 0`, or
 *   `value > maxValue`
 */
export const classify = (value: number, maxValue: number): number | null => {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || value < 0 || maxValue <= 0) {
    return null
  }

  const chunksCount = classes.length * 2 - 1
  const chunk = maxValue / chunksCount

  for (let i = 0; i < classes.length; i += 1) {
    const current = classes[i] as ComplexityClass

    // Pure zone — value falls entirely within one class
    if (2 * i * chunk <= value && value <= (2 * i + 1) * chunk) {
      return current.value
    }

    // Transition zone — value is between class[i] and class[i+1]
    const next = classes[i + 1] as ComplexityClass | undefined
    if ((2 * i + 1) * chunk < value && value < (2 * i + 2) * chunk && next !== undefined) {
      const offset = value - (2 * i + 1) * chunk

      const partLower = Math.round(
        Math.sqrt(integrate((x: number) => 1 - x / chunk, offset, chunk) / (chunk / 2)) * MEMBERSHIP_PERCENT_SCALE
      )

      const partUpper = Math.round(
        Math.sqrt(integrate((x: number) => x / chunk, 0, offset) / (chunk / 2)) * MEMBERSHIP_PERCENT_SCALE
      )

      return (current.value * partLower + next.value * partUpper) / MEMBERSHIP_PERCENT_SCALE
    }
  }

  // value > maxValue — outside the axis
  return null
}
