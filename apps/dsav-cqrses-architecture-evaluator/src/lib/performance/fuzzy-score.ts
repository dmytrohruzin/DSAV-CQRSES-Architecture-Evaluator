// =============================================================================
// Fuzzy Performance Scoring
// =============================================================================
// Scores measured response times against the performance scale using fuzzy
// trapezoid membership functions (same approach as the complexity
// classificator). The scale is sorted in descending threshold order; each
// pair of adjacent levels defines a transition zone where the score is a
// weighted combination of the two neighbours.

import { integrate } from '../classification/classificator'
import type { ValidationError } from '../validation/types'
import { finiteNumber, nonNegativeNumber } from '../validation/validators'
import type { PerformanceMetric, PerformanceScale } from './types'

/** How a fuzzy performance score was derived. */
export type PerformanceScoreBreakdown =
  | { kind: 'pure'; score: number }
  | {
      kind: 'interpolated'
      lowerScore: number
      lowerWeight: number
      upperScore: number
      upperWeight: number
      score: number
    }

/** Per-metric scoring outcome. */
export interface PerformanceMetricResult {
  name: string
  score: number
  breakdown: PerformanceScoreBreakdown | null
}

/** Defense-in-depth: thresholds must be finite ≥ 0, scores finite. */
export function validatePerformanceScale(scale: PerformanceScale[]): ValidationError[] {
  return scale.flatMap((level, idx) => [
    ...nonNegativeNumber(level.threshold, `scale[${idx}].threshold`),
    ...finiteNumber(level.score, `scale[${idx}].score`)
  ])
}

/** Trapezoid membership weights of the two classes around a transition zone. */
function membershipWeights(offset: number, chunk: number): { partLower: number; partUpper: number } {
  // Membership of the upper (lower-score) class — decreasing as value decreases
  const partUpper = Math.sqrt(integrate((x: number) => x / chunk, 0, offset) / (chunk / 2))
  // Membership of the lower (higher-score) class — increasing as value decreases
  const partLower = Math.sqrt(integrate((x: number) => 1 - x / chunk, offset, chunk) / (chunk / 2))
  return { partLower, partUpper }
}

/**
 * Explain how a response time scores against the scale: a pure class above
 * the highest / below the lowest threshold, or a weighted combination inside
 * a transition zone. Returns null for an empty or invalid scale.
 */
export function explainPerformanceScore(valueMs: number, scale: PerformanceScale[]): PerformanceScoreBreakdown | null {
  if (scale.length === 0 || !Number.isFinite(valueMs)) return null
  if (validatePerformanceScale(scale).length > 0) return null

  // Sort descending by threshold (highest threshold = lowest score first)
  const sorted = [...scale].sort((a, b) => b.threshold - a.threshold)

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (first === undefined || last === undefined) return null

  // Value above the highest threshold -> lowest score
  if (valueMs >= first.threshold) return { kind: 'pure', score: first.score }

  // Value below the lowest threshold -> highest score
  if (valueMs <= last.threshold) return { kind: 'pure', score: last.score }

  // Find which pair of thresholds the value falls between
  for (let i = 0; i < sorted.length - 1; i++) {
    const upper = sorted[i]
    const lower = sorted[i + 1]
    if (upper === undefined || lower === undefined) continue

    if (valueMs <= upper.threshold && valueMs >= lower.threshold) {
      const range = upper.threshold - lower.threshold
      if (range === 0) return { kind: 'pure', score: upper.score }

      const offset = valueMs - lower.threshold
      const { partLower, partUpper } = membershipWeights(offset, range)
      const total = partLower + partUpper
      if (total === 0) return { kind: 'pure', score: lower.score }

      const lowerWeight = partLower / total
      const upperWeight = partUpper / total
      return {
        kind: 'interpolated',
        lowerScore: lower.score,
        lowerWeight,
        upperScore: upper.score,
        upperWeight,
        score: lower.score * lowerWeight + upper.score * upperWeight
      }
    }
  }

  return { kind: 'pure', score: last.score }
}

/** Fuzzy score of a response time; 0 for an empty or invalid scale. */
export function scorePerformance(valueMs: number, scale: PerformanceScale[]): number {
  return explainPerformanceScore(valueMs, scale)?.score ?? 0
}

/** Score every metric against the scale. */
export function evaluatePerformanceMetrics(
  metrics: PerformanceMetric[],
  scale: PerformanceScale[]
): PerformanceMetricResult[] {
  return metrics.map((m) => {
    const breakdown = explainPerformanceScore(m.responseTimeMs, scale)
    return { name: m.name, score: breakdown?.score ?? 0, breakdown }
  })
}
