// =============================================================================
// Validation — Type Definitions
// =============================================================================
// Shared error shape for every lib validator. Errors carry a stable `code`
// plus interpolation `context` so the presentation layer can translate them;
// `message` is the developer-facing English fallback.

/** Stable machine-readable validation error codes. */
export type ValidationErrorCode =
  | 'missing_metric'
  | 'invalid_value'
  | 'invalid_sla_parameter'
  | 'invalid_hardware_config'
  | 'invalid_swp'
  | 'non_finite'
  | 'not_positive'
  | 'negative_value'
  | 'exceeds_max'
  | 'missing_variations'
  | 'invalid_weight'
  | 'duplicate_edge'
  | 'self_loop'

/** Validation error describing an issue with input data. */
export interface ValidationError {
  code: ValidationErrorCode
  /** Developer-facing English text (logs/tests). UI translates via code + context. */
  message: string
  /** Machine-readable location, e.g. 'variations.mCQRS.metrics.queryComplexity'. */
  field?: string
  /** Interpolation values for translated messages, e.g. { variation: 'mCQRS' }. */
  context?: Record<string, string | number>
}
