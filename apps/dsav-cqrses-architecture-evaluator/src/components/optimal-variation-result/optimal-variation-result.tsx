'use client'

import { useLanguage } from '../../i18n/language-context'
import type { OptimalResult } from '../../lib/variation-selection/types'
import styles from './optimal-variation-result.module.css'

interface OptimalVariationResultProps {
  results: OptimalResult[]
}

function formatCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} $`
}

function formatRc(value: number): string {
  return value.toFixed(3)
}

export function OptimalVariationResult({ results }: OptimalVariationResultProps) {
  const { t } = useLanguage()

  if (results.length === 0) {
    return <output className={styles.empty}>{t('tab2.optimalResultPlaceholder')}</output>
  }

  return (
    <section className={styles.container} aria-label={t('tab2.optimalResultTitle')}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('tab2.columnVariation')}</th>
              <th className={styles.numericHeader}>{t('tab2.columnRc')}</th>
              <th>{t('tab2.columnHardware')}</th>
              <th className={styles.numericHeader}>{t('tab2.columnHardwarePrice')}</th>
              <th className={styles.numericHeader}>{t('tab2.columnDevCost')}</th>
              <th className={styles.numericHeader}>{t('tab2.columnTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const rowClass = row.isOptimal ? styles.rowOptimal : row.slaUnmet ? styles.rowSlaUnmet : styles.row
              return (
                <tr key={row.variationName} className={rowClass}>
                  <td className={styles.nameCell}>
                    <span>{row.variationName}</span>
                    {row.isOptimal && <span className={styles.badgeOptimal}>{t('tab2.optimalRowBadge')}</span>}
                    {row.slaUnmet && <span className={styles.badgeSlaUnmet}>{t('tab2.slaNotMetBadge')}</span>}
                  </td>
                  <td className={styles.numericCell}>{formatRc(row.rc)}</td>
                  <td className={styles.hardwareCell}>{row.cheapestConfig?.name ?? '—'}</td>
                  <td className={styles.numericCell}>{formatCurrency(row.hardwarePrice)}</td>
                  <td className={styles.numericCell}>{formatCurrency(row.developmentCost)}</td>
                  <td className={styles.numericCell}>{formatCurrency(row.totalCost)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
