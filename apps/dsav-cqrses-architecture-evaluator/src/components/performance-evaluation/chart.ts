// ---------------------------------------------------------------------------
// Chart.js shaping for the performance evaluation chart: colors, datasets and
// metric annotations. The membership math lives in lib/performance.
// ---------------------------------------------------------------------------

import type { AnnotationOptions } from 'chartjs-plugin-annotation'
import {
  AXIS_OVERSHOOT,
  computeMembershipSeries,
  computeMetricCrossings,
  levelPeakX,
  sortByThresholdDesc
} from '../../lib/performance/membership'
import type { PerformanceMetric, PerformanceScale } from '../../lib/performance/types'

/** Membership curves are drawn as plain black lines, like the reference plot. */
const CURVE_COLOR = 'rgba(17, 24, 39, 0.9)'

/** Single uniform chart font (0.875rem, not bold) used for every chart label. */
const CHART_FONT = { size: 16, weight: 'normal' as const }

// Fully opaque so the dashed guide lines never bleed through the label boxes
// (a transparent background reads as the text being struck through).
const ANNOTATION_COLORS = [
  'rgb(37, 99, 235)',
  'rgb(217, 164, 6)',
  'rgb(16, 185, 129)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(236, 72, 153)',
  'rgb(20, 184, 166)',
  'rgb(249, 115, 22)'
] as const

function getAnnotationColor(idx: number): string {
  return ANNOTATION_COLORS[idx % ANNOTATION_COLORS.length] ?? 'rgb(107, 114, 128)'
}

/** One black line dataset per scale level (trapezoid/triangle membership curves). */
export function buildChartData(scale: PerformanceScale[]) {
  const { xValues, series } = computeMembershipSeries(scale)

  const datasets = series.map(({ level, values }) => ({
    label: `< ${level.threshold} ms (score ${level.score})`,
    data: values,
    borderColor: CURVE_COLOR,
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 0,
    tension: 0
  }))

  return { labels: xValues, datasets }
}

/**
 * Class-score labels sitting at the peak of each membership curve (the
 * "Бальна оцінка класу" row at the top of the chart).
 */
export function buildClassLabels(
  scale: PerformanceScale[],
  maxThreshold: number
): Record<string, AnnotationOptions<'label'>> {
  const sorted = sortByThresholdDesc(scale)
  if (sorted.length < 2) return {}

  const axisMax = maxThreshold * AXIS_OVERSHOOT
  const labels: Record<string, AnnotationOptions<'label'>> = {}

  for (let idx = 0; idx < sorted.length; idx++) {
    const level = sorted[idx]
    if (level === undefined) continue
    labels[`class-${idx}`] = {
      type: 'label',
      xValue: levelPeakX(idx, sorted, axisMax),
      yValue: 1,
      yAdjust: -10,
      content: String(level.score),
      color: 'rgba(17, 24, 39, 0.9)',
      font: CHART_FONT
    }
  }

  return labels
}

/**
 * Per-metric guides: a dashed vertical line dropping to the time axis and a
 * dashed horizontal line running to the membership axis for every class the
 * response time crosses, each tagged with its membership coefficient.
 */
export function buildAnnotations(
  metrics: PerformanceMetric[],
  scale: PerformanceScale[],
  maxThreshold: number
): Record<string, AnnotationOptions<'line'>> {
  const annotations: Record<string, AnnotationOptions<'line'>> = {}
  const axisMax = maxThreshold * AXIS_OVERSHOOT

  const visible = metrics
    .map((metric, i) => ({ metric, i }))
    .filter(({ metric }) => metric !== undefined && metric.responseTimeMs >= 0 && metric.responseTimeMs <= axisMax)

  // Pass 1 — horizontal guides to the membership axis, one per crossed class.
  // Drawn first so the vertical metric labels (pass 2) paint on top of them
  // instead of being struck through by a coinciding crossing line.
  for (const { metric, i } of visible) {
    const color = getAnnotationColor(i)
    const crossings = computeMetricCrossings(metric.responseTimeMs, scale)
    for (let j = 0; j < crossings.length; j++) {
      const crossing = crossings[j]
      if (crossing === undefined) continue
      annotations[`metric-${i}-cross-${j}`] = {
        type: 'line',
        xMin: 0,
        xMax: metric.responseTimeMs,
        yMin: crossing.value,
        yMax: crossing.value,
        borderColor: color,
        borderWidth: 1.5,
        borderDash: [4, 3],
        label: {
          display: true,
          content: crossing.value.toFixed(2),
          position: 'start',
          backgroundColor: color,
          color: '#fff',
          font: CHART_FONT,
          padding: 2
        }
      }
    }
  }

  // Pass 2 — vertical guide from the time axis up to the highest crossing,
  // labelled with the metric name. Added last → labels render above the lines.
  for (const { metric, i } of visible) {
    const ms = metric.responseTimeMs
    const color = getAnnotationColor(i)
    const crossings = computeMetricCrossings(ms, scale)
    const peakValue = crossings.reduce((max, c) => Math.max(max, c.value), 0)

    annotations[`metric-${i}`] = {
      type: 'line',
      xMin: ms,
      xMax: ms,
      yMin: 0,
      yMax: peakValue,
      borderColor: color,
      borderWidth: 2,
      borderDash: [6, 3],
      label: {
        display: true,
        content: `${metric.name}: ${ms} ms`,
        position: i % 2 === 0 ? 'start' : 'end',
        backgroundColor: color,
        color: '#fff',
        font: CHART_FONT,
        padding: 4
      }
    }
  }

  return annotations
}
