'use client'

import { useLanguage } from '../../i18n/language-context'
import type { RelativeHostingPriceResult } from '../../lib/variation-selection/types'
import styles from './relative-hosting-price-results.module.css'

interface RelativeHostingPriceResultsProps {
  results: RelativeHostingPriceResult[]
}

function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

function formatPc(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return value.toFixed(3)
}

export function RelativeHostingPriceResults({ results }: RelativeHostingPriceResultsProps) {
  const { t } = useLanguage()

  if (results.length === 0) {
    return <output className={styles.empty}>{t('tab2.relativeHostingPlaceholder')}</output>
  }

  return (
    <section className={styles.container} aria-label={t('tab2.relativeHostingTitle')}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('tab2.columnVariation')}</th>
              <th>{t('tab2.relativeHostingPriceColumn')}</th>
              <th>{t('tab2.relativeHostingPcColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const rowClass = row.slaUnmet ? styles.rowSlaUnmet : row.isMin ? styles.rowReference : styles.row
              return (
                <tr key={row.name} className={rowClass}>
                  <td className={styles.nameCell}>
                    <span>{row.name}</span>
                    {row.isMin && !row.slaUnmet && (
                      <span className={styles.badge}>{t('tab2.referenceVariationBadge')}</span>
                    )}
                    {row.slaUnmet && <span className={styles.badgeSlaUnmet}>{t('tab2.slaNotMetBadge')}</span>}
                  </td>
                  <td className={styles.numericCell}>{formatPrice(row.price)}</td>
                  <td className={styles.numericCell}>{formatPc(row.pc)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
