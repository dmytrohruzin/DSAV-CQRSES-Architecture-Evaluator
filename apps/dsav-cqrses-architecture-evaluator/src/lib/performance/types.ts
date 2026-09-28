// =============================================================================
// Performance Evaluation — Type Definitions
// =============================================================================

/** A single level in the performance evaluation scale */
export interface PerformanceScale {
  threshold: number
  score: number
}

/** A single named performance metric with its measured response time */
export interface PerformanceMetric {
  name: string
  responseTimeMs: number
}

/** Server response time input for performance evaluation */
export interface PerformanceInput {
  readMs: number
  writeMs: number
}

/** Result of performance evaluation for a single metric (read or write) */
export interface PerformanceResult {
  valueMs: number
  score: number
}
