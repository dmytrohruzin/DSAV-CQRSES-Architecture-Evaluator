// ---------------------------------------------------------------------------
// Display formatting for fuzzy performance scores — renders the weighted
// formula shown in the results table.
// Examples:
// - Pure class: "1 × 5 = 5.00"
// - Interpolated: "3 × 0.32 + 4 × 0.68 = 3.68"
// ---------------------------------------------------------------------------

import type { PerformanceScoreBreakdown } from '../../lib/performance/fuzzy-score'

export function formatScoreDescription(breakdown: PerformanceScoreBreakdown | null): string {
  if (breakdown === null) return ''

  if (breakdown.kind === 'pure') {
    return `1 × ${breakdown.score} = ${breakdown.score.toFixed(2)}`
  }

  const { lowerScore, lowerWeight, upperScore, upperWeight, score } = breakdown
  return `${lowerScore} × ${lowerWeight.toFixed(2)} + ${upperScore} × ${upperWeight.toFixed(2)} = ${score.toFixed(2)}`
}
