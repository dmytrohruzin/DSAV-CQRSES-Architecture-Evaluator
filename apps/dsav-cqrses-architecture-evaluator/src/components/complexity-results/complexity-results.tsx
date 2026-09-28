'use client'

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import type { AnnotationOptions } from 'chartjs-plugin-annotation'
import annotationPlugin from 'chartjs-plugin-annotation'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { useLanguage } from '../../i18n/language-context'
import styles from './complexity-results.module.css'

// ---------------------------------------------------------------------------
// Chart.js registration (runs once per module load)
// ---------------------------------------------------------------------------

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, annotationPlugin)

// ---------------------------------------------------------------------------
// Constants — fuzzy complexity classes
// ---------------------------------------------------------------------------

interface FuzzyClass {
  label: string
  abbr: string
  value: number
}

const FUZZY_CLASSES: readonly FuzzyClass[] = [
  { label: 'Very Simple', abbr: 'VS', value: 4 },
  { label: 'Simple', abbr: 'S', value: 6 },
  { label: 'Average', abbr: 'A', value: 8 },
  { label: 'Complex', abbr: 'C', value: 12 },
  { label: 'Very Complex', abbr: 'VC', value: 16 }
] as const

const CLASS_COLORS = [
  'rgba(16, 185, 129, 0.8)', // VS — green
  'rgba(59, 130, 246, 0.8)', // S  — blue
  'rgba(245, 158, 11, 0.8)', // A  — amber
  'rgba(239, 68, 68, 0.8)', // C  — red
  'rgba(139, 92, 246, 0.8)' // VC — purple
] as const

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ComplexityResultsProps {
  results: Array<{
    name: string
    designClass: number
    realizationClass: number
    total: number
  }>
  designMaxValue: number
}

// ---------------------------------------------------------------------------
// Chart helpers
// ---------------------------------------------------------------------------

/**
 * Build trapezoid membership function datasets for the 5 fuzzy classes.
 *
 * The axis [0, maxValue] is split into (2 * classCount - 1) equal chunks.
 * Each class has a trapezoidal membership function that rises to 1.0 in its
 * "pure" zone and transitions linearly in the overlap zones.
 */
function buildTrapezoidData(maxValue: number, classLabels?: string[]) {
  const classCount = FUZZY_CLASSES.length
  const chunksCount = classCount * 2 - 1
  const chunk = maxValue / chunksCount

  // Generate x values with enough resolution
  const xMax = maxValue * 1.05
  const step = Math.max(0.1, maxValue / 300)
  const xValues: number[] = []
  for (let x = 0; x <= xMax; x += step) {
    xValues.push(Math.round(x * 100) / 100)
  }

  const datasets = FUZZY_CLASSES.map((cls, idx) => {
    const color = CLASS_COLORS[idx] ?? 'rgba(107, 114, 128, 0.7)'

    const yValues = xValues.map((x) => {
      // Pure zone boundaries for this class
      const pureStart = 2 * idx * chunk
      const pureEnd = (2 * idx + 1) * chunk

      // In the pure zone: membership = 1
      if (x >= pureStart && x <= pureEnd) {
        return 1
      }

      // Rising edge: transition from previous class
      if (idx > 0) {
        const transStart = (2 * idx - 1) * chunk
        if (x >= transStart && x < pureStart) {
          return (x - transStart) / chunk
        }
      }

      // Falling edge: transition to next class
      if (idx < classCount - 1) {
        const transEnd = (2 * idx + 2) * chunk
        if (x > pureEnd && x <= transEnd) {
          return (transEnd - x) / chunk
        }
      }

      return 0
    })

    return {
      label: `${cls.abbr} = ${classLabels?.[idx] ?? cls.label} (${cls.value})`,
      data: yValues,
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0
    }
  })

  return { labels: xValues, datasets }
}

function buildAnnotation(
  totalValue: number,
  maxValue: number,
  totalLabel?: string
): Record<string, AnnotationOptions<'line'>> {
  const xMax = maxValue * 1.05
  if (totalValue < 0 || totalValue > xMax) return {}

  return {
    currentValueLine: {
      type: 'line',
      xMin: totalValue,
      xMax: totalValue,
      borderColor: 'rgba(30, 58, 95, 0.9)',
      borderWidth: 2,
      borderDash: [6, 3],
      label: {
        display: true,
        content: `${totalLabel ?? 'Total'}: ${totalValue.toFixed(2)}`,
        position: 'start',
        backgroundColor: 'rgba(30, 58, 95, 0.85)',
        color: '#fff',
        font: { size: 11, weight: 'bold' },
        padding: 4
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComplexityResults({ results, designMaxValue }: ComplexityResultsProps) {
  const { t } = useLanguage()
  // -- Computed totals --------------------------------------------------------
  const totals = useMemo(() => {
    if (results.length === 0) return null

    const designSum = results.reduce((sum, r) => sum + r.designClass, 0)
    const realizationSum = results.reduce((sum, r) => sum + r.realizationClass, 0)
    const totalSum = results.reduce((sum, r) => sum + r.total, 0)

    return { designSum, realizationSum, totalSum }
  }, [results])

  // -- Chart data (uses designMaxValue as x-axis range) -----------------------
  const fuzzyLabels = useMemo(
    () => [
      t('tab1.fuzzyVerySimple'),
      t('tab1.fuzzySimple'),
      t('tab1.fuzzyAverage'),
      t('tab1.fuzzyComplex'),
      t('tab1.fuzzyVeryComplex')
    ],
    [t]
  )

  const chartData = useMemo(() => buildTrapezoidData(designMaxValue, fuzzyLabels), [designMaxValue, fuzzyLabels])

  const chartOptions = useMemo(() => {
    const totalValue = totals?.totalSum ?? 0

    return {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'linear' as const,
          title: { display: true, text: t('tab1.complexityValueAxis') },
          min: 0,
          max: Math.round(designMaxValue * 1.05)
        },
        y: {
          title: { display: true, text: t('tab1.membershipCoefficientAxis').split('\n') },
          min: 0,
          max: 1.05
        }
      },
      plugins: {
        legend: { position: 'bottom' as const },
        annotation: {
          annotations: buildAnnotation(totalValue, designMaxValue, t('common.total'))
        }
      }
    }
  }, [designMaxValue, totals, t])

  // -- Empty state ------------------------------------------------------------
  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <section className={styles.sectionCard} aria-labelledby="results-heading">
          <h3 className={styles.sectionTitle} id="results-heading">
            {t('tab1.complexityResultsTitle')}
          </h3>
          <div className={styles.sectionBody}>
            <p className={styles.placeholder}>{t('tab1.complexityResultsPlaceholder')}</p>
          </div>
        </section>
      </div>
    )
  }

  // -- Render -----------------------------------------------------------------
  return (
    <div className={styles.container}>
      {/* Summary Table */}
      <section className={styles.sectionCard} aria-labelledby="results-table-heading">
        <h3 className={styles.sectionTitle} id="results-table-heading">
          {t('tab1.complexityResultsTitle')}
        </h3>
        <div className={styles.sectionBody}>
          <div className={styles.tableWrap}>
            <table className={styles.table} aria-label={t('tab1.complexityResultsTitle')}>
              <thead>
                <tr>
                  <th scope="col">{t('tab1.componentColumn')}</th>
                  <th scope="col">{t('tab1.designColumn')}</th>
                  <th scope="col">{t('tab1.realizationColumn')}</th>
                  <th scope="col">{t('tab1.totalColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.name}>
                    <td>{result.name}</td>
                    <td>{result.designClass.toFixed(2)}</td>
                    <td>{result.realizationClass.toFixed(2)}</td>
                    <td>{result.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trapezoid Chart */}
      <section className={styles.sectionCard} aria-labelledby="results-chart-heading">
        <h3 className={styles.sectionTitle} id="results-chart-heading">
          {t('tab1.complexityChartTitle')}
        </h3>
        <div className={styles.sectionBody}>
          <div className={styles.chartContainer}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </section>
    </div>
  )
}
