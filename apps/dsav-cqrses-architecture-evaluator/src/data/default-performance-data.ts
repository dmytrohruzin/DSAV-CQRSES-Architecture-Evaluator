// =============================================================================
// DSAV-CQRSES Architecture Evaluator — Default Performance Data
// =============================================================================
// Default performance evaluation scale and metrics used by the Parameters
// Assessment tab to score measured response times.

import type { PerformanceMetric, PerformanceScale } from '../lib/performance/types'

// -----------------------------------------------------------------------------
// Performance Scale
// -----------------------------------------------------------------------------

export const DEFAULT_PERFORMANCE_SCALE: PerformanceScale[] = [
  { threshold: 30, score: 1 },
  { threshold: 25, score: 2 },
  { threshold: 20, score: 3 },
  { threshold: 15, score: 4 }
]

// -----------------------------------------------------------------------------
// Performance Metrics
// -----------------------------------------------------------------------------

export const DEFAULT_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { name: 'Classical CQRS', responseTimeMs: 25.84 },
  { name: 'mCQRS', responseTimeMs: 14.43 }
]
