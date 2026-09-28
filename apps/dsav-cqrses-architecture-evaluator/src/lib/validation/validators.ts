// =============================================================================
// Validation — Generic Primitives
// =============================================================================
// Building blocks for domain validators. Predicates answer "is it valid?",
// validators return `ValidationError[]` (empty = valid) and never throw.
// Domain-specific validators live next to their domain modules and compose
// these primitives.

import type { ValidationError } from './types'

// -----------------------------------------------------------------------------
// Predicates (shared with UI-level checks)
// -----------------------------------------------------------------------------

/** True for finite numbers (rejects NaN and ±Infinity). */
export function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

/** True for finite numbers > 0. */
export function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/** True for finite numbers ≥ 0. */
export function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

// -----------------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------------

/** Require a finite number. */
export function finiteNumber(value: number, field: string): ValidationError[] {
  if (isFiniteNumber(value)) return []
  return [
    {
      code: 'non_finite',
      message: `"${field}" must be a finite number (got ${value})`,
      field,
      context: { field, value: String(value) }
    }
  ]
}

/** Require a finite number > 0. */
export function positiveNumber(value: number, field: string): ValidationError[] {
  if (isPositiveFinite(value)) return []
  return [
    {
      code: 'not_positive',
      message: `"${field}" must be a finite number > 0 (got ${value})`,
      field,
      context: { field, value: String(value) }
    }
  ]
}

/** Require a finite number ≥ 0. */
export function nonNegativeNumber(value: number, field: string): ValidationError[] {
  if (isNonNegativeFinite(value)) return []
  return [
    {
      code: 'negative_value',
      message: `"${field}" must be a finite number ≥ 0 (got ${value})`,
      field,
      context: { field, value: String(value) }
    }
  ]
}

/** Require a finite number ≤ max. */
export function numberAtMost(value: number, max: number, field: string): ValidationError[] {
  if (Number.isFinite(value) && value <= max) return []
  return [
    {
      code: 'exceeds_max',
      message: `"${field}" must be a finite number ≤ ${max} (got ${value})`,
      field,
      context: { field, value: String(value), max }
    }
  ]
}

/** Flatten validator results into a single error list. */
export function collect(...groups: ValidationError[][]): ValidationError[] {
  return groups.flat()
}
