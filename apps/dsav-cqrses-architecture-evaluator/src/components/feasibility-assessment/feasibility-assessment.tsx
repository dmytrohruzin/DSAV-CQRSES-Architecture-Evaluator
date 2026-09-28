'use client'

import { type FeasibilityPath, useFeasibilityAssessment } from '../../hooks/use-feasibility-assessment'
import { useLanguage } from '../../i18n/language-context'
import type { TranslationKey } from '../../i18n/translations'
import type { GraphNode, PaybackSegment } from '../../lib/migration/types'
import { DecimalInput } from '../decimal-input/decimal-input'
import styles from './feasibility-assessment.module.css'

export type { FeasibilityPath } from '../../hooks/use-feasibility-assessment'

interface FeasibilityAssessmentProps {
  source: GraphNode | null
  target: GraphNode | null
  /**
   * All viable migration paths from source to target. The first entry is the
   * recommended (pathfinder-optimal) path and is selected by default; the user
   * can switch to any other path via the summary table.
   */
  paths: FeasibilityPath[]
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}

function formatMonths(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return value.toFixed(2)
}

function segmentDuration(segment: PaybackSegment): string {
  if (segment.endMonth === null) return '—'
  return (segment.endMonth - segment.startMonth).toFixed(2)
}

function segmentLabel(segment: PaybackSegment, edgeIndex: number, t: (key: TranslationKey) => string): string {
  if (segment.kind === 'initial') return t('tab3.feasibilityBreakdownInitial')
  if (segment.kind === 'edge') {
    return t('tab3.feasibilityBreakdownEdge')
      .replace('{n}', String(edgeIndex))
      .replace('{from}', segment.fromName)
      .replace('{to}', segment.toName)
  }
  return t('tab3.feasibilityBreakdownTarget').replace('{target}', segment.fromName)
}

export function FeasibilityAssessment({ source, target, paths }: FeasibilityAssessmentProps) {
  const { t } = useLanguage()

  const {
    enabled,
    hardwareHosting,
    selectedPath,
    hardwareSupport,
    result,
    pathSummary,
    handleToggle,
    handleHardwareHosting,
    handlePathCost,
    handleSelectPath
  } = useFeasibilityAssessment({ source, target, paths })

  let paybackText: string
  if (result.paybackMonths !== null) {
    paybackText = t('tab3.feasibilityPaybackResult').replace('{months}', result.paybackMonths.toFixed(2))
  } else if (result.monthlyMigrationTotal > result.monthlyUpgradeTotal) {
    const diff = result.monthlyMigrationTotal - result.monthlyUpgradeTotal
    paybackText = t('tab3.feasibilityNoPaybackMoreExpensive').replace('{diff}', formatMoney(diff))
  } else {
    paybackText = t('tab3.feasibilityNoPayback')
  }

  return (
    <section aria-labelledby="feasibility-heading" className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h3 id="feasibility-heading" className={styles.sectionTitle}>
          {t('tab3.feasibilityTitle')}
        </h3>
      </div>

      <div className={styles.sectionBody}>
        <label className={styles.toggleRow}>
          <input type="checkbox" className={styles.toggleCheckbox} checked={enabled} onChange={handleToggle} />
          <span>{t('tab3.feasibilityToggleLabel')}</span>
        </label>

        {enabled && (
          <div className={styles.formBody}>
            {pathSummary.length > 0 && (
              <div className={styles.breakdownWrapper}>
                <h4 className={styles.breakdownTitle}>{t('tab3.feasibilityAllPathsTitle')}</h4>
                <div className={styles.tableWrapper}>
                  <table
                    className={`${styles.table} ${styles.summaryTable}`}
                    aria-label={t('tab3.feasibilityAllPathsTitle')}
                  >
                    <thead>
                      <tr>
                        <th aria-label="select" className={styles.summarySelectCell} />
                        <th>{t('tab3.feasibilityAlternativesPathColumn')}</th>
                        <th className={styles.summaryColDuration}>{t('tab3.feasibilityAlternativesDurationColumn')}</th>
                        <th className={styles.summaryColCost}>{t('tab3.feasibilityAlternativesCostColumn')}</th>
                        <th className={styles.summaryColPayback}>{t('tab3.feasibilityAlternativesPaybackColumn')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pathSummary.map((row, idx) => {
                        const isRecommended = idx === 0
                        const isSelected = row.id === (selectedPath?.id ?? null)
                        const rowClass = isSelected ? styles.summaryRowSelected : ''
                        return (
                          <tr key={row.id} className={rowClass}>
                            <td className={styles.summarySelectCell}>
                              <input
                                type="radio"
                                name="feasibility-path"
                                value={row.id}
                                checked={isSelected}
                                onChange={() => handleSelectPath(row.id)}
                                aria-label={`Select path ${row.label}`}
                              />
                            </td>
                            <td className={styles.summaryPathCell}>
                              <span className={styles.summaryPathLabel}>{row.label}</span>
                              {isRecommended && (
                                <span className={styles.summaryBadgeRecommended}>
                                  {t('tab3.feasibilityAllPathsRecommendedBadge')}
                                </span>
                              )}
                            </td>
                            <td className={`${styles.breakdownNumeric} ${styles.summaryColDuration}`}>
                              {formatMonths(row.duration)}
                            </td>
                            <td className={styles.summaryColCost}>
                              <DecimalInput
                                value={row.cost}
                                onChange={(v) => handlePathCost(row.id, v)}
                                className={`${styles.cellInput} ${styles.summaryCostInput}`}
                                min={0}
                                aria-label={`${t('tab3.feasibilityAlternativesCostColumn')} — ${row.label}`}
                              />
                            </td>
                            <td className={`${styles.summaryCellPayback} ${styles.summaryColPayback}`}>
                              {row.payback !== null
                                ? t('tab3.feasibilityAlternativesPaybackInline').replace(
                                    '{months}',
                                    row.payback.toFixed(2)
                                  )
                                : t('tab3.feasibilityNoPayback')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.table} aria-label={t('tab3.feasibilityTitle')}>
                <thead>
                  <tr>
                    <th />
                    <th>{t('tab3.feasibilityColNow')}</th>
                    <th>{t('tab3.feasibilityColUpgrade')}</th>
                    <th>{t('tab3.feasibilityColAfter')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowLabel}>
                      {t('tab3.feasibilitySupportCost')}
                    </th>
                    <td className={styles.derivedCell}>{formatMoney(source?.supportCost)}</td>
                    <td className={styles.derivedCell}>{formatMoney(hardwareSupport)}</td>
                    <td className={styles.derivedCell}>{formatMoney(target?.supportCost)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowLabel}>
                      {t('tab3.feasibilityHostingCost')}
                    </th>
                    <td className={styles.derivedCell}>{formatMoney(source?.hostingCost)}</td>
                    <td>
                      <DecimalInput
                        value={hardwareHosting}
                        onChange={handleHardwareHosting}
                        className={styles.cellInput}
                        min={0}
                        aria-label={`${t('tab3.feasibilityHostingCost')} — ${t('tab3.feasibilityColUpgrade')}`}
                      />
                    </td>
                    <td className={styles.derivedCell}>{formatMoney(target?.hostingCost)}</td>
                  </tr>
                  <tr className={styles.totalsRow}>
                    <th scope="row" className={styles.rowLabel}>
                      {t('tab3.feasibilityMonthlyTotal')}
                    </th>
                    <td className={styles.totalCell}>{formatMoney(result.monthlyNowTotal)}</td>
                    <td className={styles.totalCell}>{formatMoney(result.monthlyUpgradeTotal)}</td>
                    <td className={styles.totalCell}>{formatMoney(result.monthlyMigrationTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.durationRow}>
              <span className={styles.fieldLabel}>{t('tab3.feasibilityMigrationDuration')}</span>
              <span className={styles.durationValue}>{formatMonths(result.migrationDurationMonths)}</span>
            </div>

            <output className={`${styles.payback} ${result.paybackMonths === null ? styles.paybackNegative : ''}`}>
              {paybackText}
            </output>

            {result.usesFallback && (
              <output className={styles.fallbackWarning}>{t('tab3.feasibilityInstantaneousFallback')}</output>
            )}

            {result.breakdown && result.breakdown.segments.length > 0 && (
              <div className={styles.breakdownWrapper}>
                <h4 className={styles.breakdownTitle}>{t('tab3.feasibilityBreakdownTitle')}</h4>
                <div className={styles.tableWrapper}>
                  <table className={styles.table} aria-label={t('tab3.feasibilityBreakdownTitle')}>
                    <thead>
                      <tr>
                        <th>{t('tab3.feasibilityBreakdownStepColumn')}</th>
                        <th>{t('tab3.feasibilityBreakdownDurationColumn')}</th>
                        <th>{t('tab3.feasibilityBreakdownCumMigrationColumn')}</th>
                        <th>{t('tab3.feasibilityBreakdownCumUpgradeColumn')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.segments.map((segment, idx) => {
                        const label = segmentLabel(segment, idx, t)
                        const rowClass = segment.paybackReached ? styles.breakdownRowPayback : ''
                        const key = `${segment.kind}-${segment.fromName}-${segment.toName}-${segment.startMonth}`
                        return (
                          <tr key={key} className={rowClass}>
                            <td>
                              <span>{label}</span>
                              {segment.paybackReached && (
                                <span className={styles.breakdownBadge}>
                                  {t('tab3.feasibilityBreakdownPaybackBadge')}
                                </span>
                              )}
                            </td>
                            <td className={styles.breakdownNumeric}>{segmentDuration(segment)}</td>
                            <td className={styles.breakdownNumeric}>{formatMoney(segment.cumMigration)}</td>
                            <td className={styles.breakdownNumeric}>{formatMoney(segment.cumUpgrade)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
