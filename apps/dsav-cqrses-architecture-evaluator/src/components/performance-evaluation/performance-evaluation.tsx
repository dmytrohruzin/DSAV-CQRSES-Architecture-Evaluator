'use client'

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useLanguage } from '../../i18n/language-context'
import { evaluatePerformanceMetrics } from '../../lib/performance/fuzzy-score'
import type { PerformanceMetric, PerformanceScale } from '../../lib/performance/types'
import { isNonNegativeFinite, isPositiveFinite } from '../../lib/validation/validators'
import { buildAnnotations, buildChartData, buildClassLabels } from './chart'
import { formatScoreDescription } from './format'
import styles from './performance-evaluation.module.css'

// ---------------------------------------------------------------------------
// Chart.js registration (runs once per module load)
// ---------------------------------------------------------------------------

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Uniform chart font (0.875rem, not bold) shared across axes, ticks and title. */
const CHART_FONT = { size: 16, weight: 'normal' as const }

interface PerformanceEvaluationProps {
  scale: PerformanceScale[]
  onScaleChange: (scale: PerformanceScale[]) => void
  metrics: PerformanceMetric[]
  onMetricsChange: (metrics: PerformanceMetric[]) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PerformanceEvaluation({ scale, onScaleChange, metrics, onMetricsChange }: PerformanceEvaluationProps) {
  const { t } = useLanguage()

  // -- New metric form state ---------------------------------------------------
  const [newMetricName, setNewMetricName] = useState('')
  const [newMetricResponseTime, setNewMetricResponseTime] = useState(0)

  // -- Computed results (per metric) ------------------------------------------
  const metricResults = useMemo(
    () =>
      evaluatePerformanceMetrics(metrics, scale).map((result) => ({
        score: result.score,
        description: formatScoreDescription(result.breakdown)
      })),
    [metrics, scale]
  )

  // -- Chart data -------------------------------------------------------------
  const sorted = useMemo(() => [...scale].sort((a, b) => b.threshold - a.threshold), [scale])
  const maxThreshold = sorted[0]?.threshold ?? 400

  const chartData = useMemo(() => buildChartData(scale), [scale])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear' as const,
          title: { display: true, text: t('tab1.responseTimeAxis'), font: CHART_FONT },
          ticks: { font: CHART_FONT },
          min: 0,
          max: Math.round(maxThreshold * 1.1)
        },
        y: {
          title: {
            display: true,
            text: t('tab1.membershipCoefficientAxis').split('\n'),
            font: CHART_FONT,
            padding: { bottom: 16 }
          },
          ticks: { font: CHART_FONT },
          min: 0,
          max: 1.3
        }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: t('tab1.classScoreAxis'), position: 'top' as const, font: CHART_FONT },
        annotation: {
          annotations: {
            ...buildClassLabels(scale, maxThreshold),
            ...buildAnnotations(metrics, scale, maxThreshold)
          }
        }
      }
    }),
    [metrics, scale, maxThreshold, t]
  )

  // -- Scale handlers ---------------------------------------------------------
  const handleThresholdChange = (index: number, value: string) => {
    const num = Number.parseFloat(value)
    if (Number.isNaN(num)) return
    const next = scale.map((s, i) => (i === index ? { ...s, threshold: Math.max(0, num) } : s))
    onScaleChange(next)
  }

  const handleScoreChange = (index: number, value: string) => {
    const num = Number.parseFloat(value)
    if (Number.isNaN(num)) return
    const next = scale.map((s, i) => (i === index ? { ...s, score: Math.max(0, num) } : s))
    onScaleChange(next)
  }

  const handleAddLevel = () => {
    const lastItem = scale[scale.length - 1]
    const lastThreshold = lastItem?.threshold ?? 100
    const lastScore = lastItem?.score ?? 1
    onScaleChange([
      ...scale,
      {
        threshold: Math.max(1, Math.round(lastThreshold / 2)),
        score: lastScore + 1
      }
    ])
  }

  const handleRemoveLast = () => {
    if (scale.length > 1) {
      onScaleChange(scale.slice(0, -1))
    }
  }

  // -- Metric handlers --------------------------------------------------------
  const handleMetricResponseTimeChange = (index: number, value: string) => {
    const num = Number.parseFloat(value)
    if (Number.isNaN(num)) return
    const next = metrics.map((m, i) => (i === index ? { ...m, responseTimeMs: Math.max(0, num) } : m))
    onMetricsChange(next)
  }

  const handleAddMetric = () => {
    const trimmed = newMetricName.trim()
    if (trimmed === '') return
    onMetricsChange([...metrics, { name: trimmed, responseTimeMs: newMetricResponseTime }])
    setNewMetricName('')
    setNewMetricResponseTime(0)
  }

  const handleRemoveMetric = (index: number) => {
    onMetricsChange(metrics.filter((_, i) => i !== index))
  }

  const handleAddMetricKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddMetric()
    }
  }

  // -- Render -----------------------------------------------------------------
  return (
    <div className={styles.container}>
      {/* Performance Scale */}
      <section className={styles.sectionCard} aria-labelledby="perf-scale-heading">
        <h3 className={styles.sectionTitle} id="perf-scale-heading">
          {t('tab1.performanceScaleTitle')}
        </h3>
        <div className={styles.sectionBody}>
          <div className={styles.scaleTableWrap}>
            <table className={styles.scaleTable}>
              <thead>
                <tr>
                  <th scope="col">{t('common.level')}</th>
                  {scale.map((_level, idx) => (
                    <th key={`level-h-${String(idx)}`} scope="col">
                      {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={styles.scaleRow}>
                  <td>{t('tab1.thresholdMs')}</td>
                  {scale.map((level, idx) => (
                    <td key={`level-t-${String(idx)}`}>
                      <input
                        type="number"
                        className={`${styles.numberInput} ${isNonNegativeFinite(level.threshold) ? '' : styles.numberInputError}`}
                        value={level.threshold}
                        min={0}
                        step={1}
                        onChange={(e) => handleThresholdChange(idx, e.target.value)}
                        aria-label={`Level ${idx + 1} threshold in milliseconds`}
                        aria-invalid={!isNonNegativeFinite(level.threshold)}
                      />
                    </td>
                  ))}
                </tr>
                <tr className={styles.scaleRow}>
                  <td>{t('common.score')}</td>
                  {scale.map((level, idx) => (
                    <td key={`level-s-${String(idx)}`}>
                      <input
                        type="number"
                        className={`${styles.numberInput} ${isPositiveFinite(level.score) ? '' : styles.numberInputError}`}
                        value={level.score}
                        min={0}
                        step={1}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        aria-label={`Level ${idx + 1} score`}
                        aria-invalid={!isPositiveFinite(level.score)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.scaleActions}>
            <button type="button" className={styles.addLevelButton} onClick={handleAddLevel}>
              {t('tab1.addLevel')}
            </button>
            <button
              type="button"
              className={styles.removeLevelButton}
              onClick={handleRemoveLast}
              disabled={scale.length <= 1}
            >
              {t('tab1.removeLast')}
            </button>
          </div>
        </div>
      </section>

      {/* Performance Results (merged table) */}
      <section className={styles.sectionCard} aria-labelledby="perf-results-heading">
        <h3 className={styles.sectionTitle} id="perf-results-heading">
          {t('tab1.performanceResultsTitle')}
        </h3>
        <div className={styles.sectionBody}>
          <div className={styles.resultsTableWrap}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th scope="col">{t('tab1.metricNameColumn')}</th>
                  <th scope="col">{t('tab1.responseTimeMsColumn')}</th>
                  <th scope="col">{t('tab1.calculationColumn')}</th>
                  <th scope="col">{t('tab1.performanceScoreColumn')}</th>
                  <th scope="col" className={styles.actionsColumn}>
                    <span className={styles.srOnly}>{t('common.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => {
                  const result = metricResults[idx]
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: metrics lack stable IDs
                    <tr key={idx} className={styles.resultsRow}>
                      <td className={styles.metricNameCell}>{metric.name}</td>
                      <td>
                        <input
                          type="number"
                          className={styles.numberInput}
                          value={metric.responseTimeMs}
                          min={0}
                          step={1}
                          onChange={(e) => handleMetricResponseTimeChange(idx, e.target.value)}
                          aria-label={`${metric.name} response time in milliseconds`}
                        />
                      </td>
                      <td className={styles.calculationCell}>{result?.description ?? ''}</td>
                      <td className={styles.scoreCell}>{result?.score.toFixed(2) ?? '0.00'}</td>
                      <td className={styles.actionsColumn}>
                        <button
                          type="button"
                          className={styles.removeMetricButton}
                          onClick={() => handleRemoveMetric(idx)}
                          aria-label={`${t('tab1.removeMetric')}: ${metric.name}`}
                          title={t('tab1.removeMetric')}
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {metrics.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      {t('tab1.addPerformanceMetric')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add metric form */}
          <div className={styles.addMetricRow}>
            <input
              type="text"
              className={styles.addMetricInput}
              value={newMetricName}
              onChange={(e) => setNewMetricName(e.target.value)}
              onKeyDown={handleAddMetricKeyDown}
              placeholder={t('tab1.metricNamePlaceholder')}
              aria-label={t('tab1.metricNamePlaceholder')}
            />
            <input
              type="number"
              className={styles.addMetricResponseTimeInput}
              value={newMetricResponseTime}
              min={0}
              step={1}
              onChange={(e) => {
                const num = Number.parseFloat(e.target.value)
                if (!Number.isNaN(num)) setNewMetricResponseTime(Math.max(0, num))
              }}
              onKeyDown={handleAddMetricKeyDown}
              placeholder={t('tab1.responseTimePlaceholder')}
              aria-label={t('tab1.responseTimePlaceholder')}
            />
            <button
              type="button"
              className={styles.addMetricButton}
              onClick={handleAddMetric}
              disabled={newMetricName.trim() === ''}
            >
              {t('tab1.addPerformanceMetric')}
            </button>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section className={styles.sectionCard} aria-labelledby="perf-chart-heading">
        <h3 className={styles.sectionTitle} id="perf-chart-heading">
          {t('tab1.performanceChartTitle')}
        </h3>
        <div className={styles.sectionBody}>
          <div className={styles.chartContainer}>
            {chartData.datasets.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>{t('tab1.addAtLeastTwoLevels')}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
