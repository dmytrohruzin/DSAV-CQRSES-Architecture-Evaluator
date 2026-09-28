'use client'

import { useLanguage } from '../../i18n/language-context'
import type { RelativeComplexityResult } from '../../lib/variation-selection/types'
import styles from './relative-complexity-results.module.css'

interface RelativeComplexityResultsProps {
  results: RelativeComplexityResult[]
}

export function RelativeComplexityResults({ results }: RelativeComplexityResultsProps) {
  const { t } = useLanguage()

  if (results.length === 0) {
    return <output className={styles.empty}>{t('tab2.relativeComplexityPlaceholder')}</output>
  }

  return (
    <section className={styles.container} aria-label={t('tab2.relativeComplexityTitle')}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('tab2.columnVariation')}</th>
              <th>{t('tab2.relativeComplexityRcColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.name} className={row.isMin ? styles.rowReference : styles.row}>
                <td className={styles.nameCell}>
                  <span>{row.name}</span>
                  {row.isMin && <span className={styles.badge}>{t('tab2.referenceVariationBadge')}</span>}
                </td>
                <td className={styles.numericCell}>{row.rc.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
