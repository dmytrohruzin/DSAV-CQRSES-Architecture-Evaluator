// ---------------------------------------------------------------------------
// Maps lib validation error codes to translated, interpolated messages.
// Falls back to the developer-facing `error.message` for unmapped codes.
// ---------------------------------------------------------------------------

import type { ValidationError, ValidationErrorCode } from '../lib/validation/types'
import type { TranslationKey } from './translations'

const CODE_TO_KEY: Partial<Record<ValidationErrorCode, TranslationKey>> = {
  missing_metric: 'validation.missingMetric',
  invalid_value: 'validation.invalidValue',
  invalid_weight: 'validation.invalidWeight',
  invalid_swp: 'validation.invalidSwp',
  non_finite: 'validation.nonFinite',
  not_positive: 'validation.notPositive',
  negative_value: 'validation.negativeValue',
  exceeds_max: 'validation.exceedsMax',
  missing_variations: 'validation.missingVariations'
}

/** Translate a validation error using its code and context placeholders. */
export function validationMessage(error: ValidationError, t: (key: TranslationKey) => string): string {
  const key = CODE_TO_KEY[error.code]
  // Without interpolation context the template cannot be filled — fall back
  // to the developer-facing message.
  if (key === undefined || error.context === undefined) return error.message

  let text = t(key)
  for (const [name, value] of Object.entries(error.context)) {
    text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}
