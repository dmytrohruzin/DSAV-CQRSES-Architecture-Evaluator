// =============================================================================
// DSAV-CQRSES Architecture Evaluator — Relative Integral Complexity (AHP, complexity-only)
// =============================================================================
// Compares architectural variations with the analytic hierarchy process (AHP).
// The variation judged simplest becomes the reference (etalon) and every other
// variation is compared with it *pairwise*, one 2x2 comparison at a time:
//
//   pairPriority(i, base)[k] = v_i[k] / (v_i[k] + v_base[k])     (per criterion)
//   p_i  = Σ_k pairPriority(i, base)[k] · weightNorm[k]
//   p_b  = Σ_k pairPriority(base, i)[k] · weightNorm[k]   (= 1 − p_i)
//   rc_i = p_i / p_b                                       (rc_base = 1)
//
// Pairwise — not share-of-total — normalization is what makes rc_i depend only
// on the pair (i, base). Normalizing each criterion by the sum over *all*
// variations makes the denominator set-dependent, and since it shifts by a
// different factor per criterion, adding a third variation would silently
// change the relative complexity of the first two (AHP rank reversal).
//
// The percentage score r_i is a share derived from rc so both stay consistent:
//
//   r_i = round( 100 · rc_i / Σ_j rc_j · 100 ) / 100           (Σ r_i ≈ 100 %)
//
// For two variations this reproduces the legacy share-of-total figures exactly.

import { createLogger } from '@dbbs/logger'

import type { ValidationError } from '../validation/types'
import type { ApplicabilityResult, RelativeComplexityResult, VariationMetrics } from './types'

const logger = createLogger({ name: 'dsav-cqrses' })

/** Tolerance for the internal weight-normalization invariant check. */
const NORMALIZATION_TOLERANCE = 0.0001
/** Tolerance for the "results sum to ~100%" invariant check. */
const RESULT_SUM_TOLERANCE = 0.1
/** Scores are percentages rounded to 2 decimals: round(x · 100 · 100) / 100. */
const PERCENT_SCALE = 100
const ROUNDING_SCALE = 100

/** Safe record access — returns 0 for missing keys. */
function val(record: Record<string, number>, key: string): number {
  return record[key] ?? 0
}

/**
 * Defense-in-depth validation for `computeRelativeComplexity`.
 *
 * Deliberately treats two reachable states as valid: an empty `variations`
 * list (yields no rows) and an empty `metricKeys` list (all attributes
 * disabled — yields all-zero rows).
 */
export function validateApplicabilityInputs(
  componentWeights: Record<string, number>,
  variations: VariationMetrics[],
  metricKeys: string[]
): ValidationError[] {
  const errors: ValidationError[] = []

  let totalWeight = 0
  for (const key of metricKeys) {
    const weight = val(componentWeights, key)
    if (!Number.isFinite(weight) || weight < 0) {
      errors.push({
        code: 'invalid_weight',
        message: `Component weight "${key}" must be a finite number ≥ 0 (got ${weight})`,
        field: `componentWeights.${key}`,
        context: { metricKey: key, value: String(weight) }
      })
      continue
    }
    totalWeight += weight
  }
  if (metricKeys.length > 0 && errors.length === 0 && totalWeight <= 0) {
    errors.push({
      code: 'invalid_weight',
      message: 'Component weights must not all be zero',
      field: 'componentWeights',
      context: { metricKey: '*', value: 0 }
    })
  }

  for (const variation of variations) {
    for (const key of metricKeys) {
      const value = variation.metrics[key]
      if (value === undefined) {
        errors.push({
          code: 'missing_metric',
          message: `Variation "${variation.name}" is missing metric "${key}"`,
          field: `variations.${variation.name}.metrics.${key}`,
          context: { variation: variation.name, metricKey: key }
        })
      } else if (!Number.isFinite(value) || value <= 0) {
        errors.push({
          code: 'invalid_value',
          message: `Variation "${variation.name}" metric "${key}" must be > 0 (got ${value})`,
          field: `variations.${variation.name}.metrics.${key}`,
          context: { variation: variation.name, metricKey: key, value: String(value) }
        })
      }
    }
  }

  return errors
}

/** Normalize the criterion weights so they sum to 1.0; null when unusable. */
function normalizeWeights(
  componentWeights: Record<string, number>,
  metricKeys: string[]
): Record<string, number> | null {
  const totalWeight = metricKeys.reduce((sum, key) => sum + val(componentWeights, key), 0)
  if (totalWeight <= 0) return null

  const weightNorm: Record<string, number> = {}
  for (const key of metricKeys) {
    weightNorm[key] = val(componentWeights, key) / totalWeight
  }

  const normSum = Object.values(weightNorm).reduce((sum, v) => sum + v, 0)
  if (Math.abs(normSum - 1) > NORMALIZATION_TOLERANCE) {
    logger.warn('Weight normalization failed')
  }
  return weightNorm
}

/**
 * Local AHP priority of `subject` inside the single pairwise comparison
 * (subject, rival): the criterion-weighted share of the pair. Each criterion
 * contributes `v_subject / (v_subject + v_rival)`, so the two priorities of a
 * pair always sum to 1 and a larger value means *more* complex.
 *
 * Depends on the two variations only — never on the rest of the set.
 */
function pairPriority(
  subject: VariationMetrics,
  rival: VariationMetrics,
  metricKeys: string[],
  weightNorm: Record<string, number>
): number {
  let priority = 0
  for (const key of metricKeys) {
    const own = val(subject.metrics, key)
    const other = val(rival.metrics, key)
    const pairSum = own + other
    if (pairSum <= 0) continue
    priority += (own / pairSum) * val(weightNorm, key)
  }
  return priority
}

/**
 * Index of the simplest variation — the AHP reference the others are compared
 * with. Chosen by a round-robin of pairwise comparisons: the variation that
 * comes out simpler in the most head-to-head duels wins. Each duel is itself
 * set-independent, so adding a strictly more complex variation cannot move the
 * reference. Ties resolve to the first occurrence.
 */
export function selectBaseVariationIndex(
  variations: VariationMetrics[],
  metricKeys: string[],
  weightNorm: Record<string, number>
): number {
  let bestIndex = 0
  let bestWins = -1

  for (let i = 0; i < variations.length; i++) {
    const candidate = variations[i]
    if (!candidate) continue

    let wins = 0
    for (let j = 0; j < variations.length; j++) {
      const rival = variations[j]
      if (i === j || !rival) continue
      // Priorities of a pair sum to 1, so < 0.5 means "simpler than the rival".
      if (pairPriority(candidate, rival, metricKeys, weightNorm) < 0.5) wins++
    }

    if (wins > bestWins) {
      bestWins = wins
      bestIndex = i
    }
  }

  return bestIndex
}

/**
 * Compare every variation with the simplest one and return its relative
 * integral complexity `rc` (how many times harder it is to build than the
 * reference) together with the derived percentage share `r`.
 *
 * `rc` of a variation depends only on that variation and the reference, so
 * adding further, more complex variations leaves the existing values intact.
 *
 * Inputs are re-validated here (defense in depth); invalid input yields an
 * empty result instead of silent NaN propagation.
 */
export function computeRelativeComplexity(
  componentWeights: Record<string, number>,
  variations: VariationMetrics[],
  metricKeys: string[]
): RelativeComplexityResult[] {
  if (variations.length === 0) return []

  const validationErrors = validateApplicabilityInputs(componentWeights, variations, metricKeys)
  if (validationErrors.length > 0) {
    logger.warn(`Invalid applicability inputs: ${validationErrors.map((e) => e.message).join('; ')}`)
    return []
  }

  const weightNorm = normalizeWeights(componentWeights, metricKeys)
  // No active quality attribute — nothing to compare on.
  if (weightNorm === null) {
    return variations.map((variation) => ({ name: variation.name, r: 0, rc: 0, isMin: false }))
  }

  const baseIndex = selectBaseVariationIndex(variations, metricKeys, weightNorm)
  const base = variations[baseIndex]
  if (!base) return []

  const relative = variations.map((variation, index) => {
    const own = pairPriority(variation, base, metricKeys, weightNorm)
    const reference = pairPriority(base, variation, metricKeys, weightNorm)
    return {
      name: variation.name,
      rc: reference > 0 ? own / reference : 0,
      isMin: index === baseIndex
    }
  })

  // Percentage shares derived from rc — keeps r and rc mutually consistent.
  const rcSum = relative.reduce((sum, row) => sum + row.rc, 0)
  const results: RelativeComplexityResult[] = relative.map((row) => ({
    ...row,
    r: rcSum > 0 ? Math.round((row.rc / rcSum) * PERCENT_SCALE * ROUNDING_SCALE) / ROUNDING_SCALE : 0
  }))

  const resultSum = results.reduce((sum, row) => sum + row.r, 0)
  if (rcSum > 0 && Math.abs(resultSum - PERCENT_SCALE) > RESULT_SUM_TOLERANCE) {
    logger.warn(`Result normalization failed: sum=${resultSum}`)
  }

  return results
}

/** Project the relative-complexity rows onto the integral score table (r_i, %). */
export function toRCResults(relativeComplexities: RelativeComplexityResult[]): ApplicabilityResult[] {
  return relativeComplexities.map((row) => ({ name: row.name, applicability: row.r }))
}

/**
 * Calculate the integral complexity percentage r_i for each variation from
 * pre-computed component weights and per-variation complexity metrics.
 */
export function calculateApplicabilityFromWeights(
  componentWeights: Record<string, number>,
  variations: VariationMetrics[],
  metricKeys: string[]
): ApplicabilityResult[] {
  return toRCResults(computeRelativeComplexity(componentWeights, variations, metricKeys))
}
