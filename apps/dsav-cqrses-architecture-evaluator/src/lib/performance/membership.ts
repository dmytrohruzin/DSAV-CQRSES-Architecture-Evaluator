// =============================================================================
// Trapezoid Membership Sampling
// =============================================================================
// Samples the per-class membership functions over the response-time axis so
// the presentation layer can plot them. Chart-agnostic: returns plain x/y
// value arrays per scale level.

import type { PerformanceScale } from './types'

export interface MembershipSeries {
  /** Sampled response-time values (ms). */
  xValues: number[]
  /** One membership curve per scale level, in descending threshold order. */
  series: Array<{ level: PerformanceScale; values: number[] }>
}

/** Membership value of one class at a single response time. */
export interface MetricCrossing {
  /** The scale level (class) whose curve is crossed. */
  level: PerformanceScale
  /** Index of the level in the descending-threshold ordering. */
  index: number
  /** Membership coefficient at the sampled response time (0..1). */
  value: number
}

/** Axis extends 10% past the highest threshold. */
export const AXIS_OVERSHOOT = 1.1
/** Target sample count along the axis. */
const TARGET_SAMPLES = 200
/** Memberships at or below this are treated as "not crossed". */
const CROSSING_EPSILON = 1e-4

/** Sort a scale descending by threshold (highest threshold / lowest score first). */
export function sortByThresholdDesc(scale: PerformanceScale[]): PerformanceScale[] {
  return [...scale].sort((a, b) => b.threshold - a.threshold)
}

/**
 * Trapezoid/triangle membership of the level at `idx` (within a descending
 * `sorted` scale) at response time `x`. End classes are trapezoids (flat at 1
 * beyond their threshold), middle classes are triangles peaking at threshold.
 */
export function levelMembershipAt(x: number, idx: number, sorted: PerformanceScale[]): number {
  const level = sorted[idx]
  if (level === undefined) return 0

  if (idx === 0) {
    // Highest threshold (lowest score) — membership = 1 above threshold, fades below
    const next = sorted[1]
    if (next === undefined) return x >= level.threshold ? 1 : 0
    if (x >= level.threshold) return 1
    if (x <= next.threshold) return 0
    return (x - next.threshold) / (level.threshold - next.threshold)
  }
  if (idx === sorted.length - 1) {
    // Lowest threshold (highest score) — membership = 1 below threshold, fades above
    const prev = sorted[idx - 1]
    if (prev === undefined) return x <= level.threshold ? 1 : 0
    if (x <= level.threshold) return 1
    if (x >= prev.threshold) return 0
    return (prev.threshold - x) / (prev.threshold - level.threshold)
  }
  // Middle classes — triangle membership
  const prev = sorted[idx - 1]
  const next = sorted[idx + 1]
  if (prev === undefined || next === undefined) return 0
  if (x <= next.threshold || x >= prev.threshold) return 0
  if (x <= level.threshold) {
    return (x - next.threshold) / (level.threshold - next.threshold)
  }
  return (prev.threshold - x) / (prev.threshold - level.threshold)
}

/** X position where a level's curve reaches its plateau / peak (membership = 1). */
export function levelPeakX(idx: number, sorted: PerformanceScale[], axisMax: number): number {
  const level = sorted[idx]
  if (level === undefined) return 0
  // Highest-threshold trapezoid plateaus to the right; centre the label on it.
  if (idx === 0) return (level.threshold + axisMax) / 2
  // Lowest-threshold trapezoid plateaus to the left of its threshold.
  if (idx === sorted.length - 1) return level.threshold / 2
  // Triangles peak exactly at their threshold.
  return level.threshold
}

/**
 * Sample trapezoid membership curves for every scale level. Returns empty
 * arrays when the scale has fewer than two levels (no zones to plot).
 */
export function computeMembershipSeries(scale: PerformanceScale[]): MembershipSeries {
  const sorted = sortByThresholdDesc(scale)
  if (sorted.length < 2) {
    return { xValues: [], series: [] }
  }

  const first = sorted[0]
  if (first === undefined) return { xValues: [], series: [] }

  const maxThreshold = first.threshold
  const step = Math.max(1, Math.round(maxThreshold / TARGET_SAMPLES))
  const xValues: number[] = []
  for (let x = 0; x <= maxThreshold * AXIS_OVERSHOOT; x += step) {
    xValues.push(x)
  }

  const series = sorted.map((level, idx) => ({
    level,
    values: xValues.map((x) => levelMembershipAt(x, idx, sorted))
  }))

  return { xValues, series }
}

/**
 * Membership coefficients of every class crossed by a response time, in
 * descending-threshold order. Only classes with a non-negligible membership
 * are returned (typically the two neighbours of a transition zone).
 */
export function computeMetricCrossings(x: number, scale: PerformanceScale[]): MetricCrossing[] {
  const sorted = sortByThresholdDesc(scale)
  if (sorted.length < 2) return []

  const crossings: MetricCrossing[] = []
  for (let index = 0; index < sorted.length; index++) {
    const level = sorted[index]
    if (level === undefined) continue
    const value = levelMembershipAt(x, index, sorted)
    if (value > CROSSING_EPSILON) crossings.push({ level, index, value })
  }
  return crossings
}
