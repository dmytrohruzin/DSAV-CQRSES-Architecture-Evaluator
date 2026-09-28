'use client'

import { useMemo } from 'react'
import { useLanguage } from '../../i18n/language-context'
import type { GraphNode, PathResult } from '../../lib/migration/types'
import styles from './migration-results.module.css'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MigrationResultsProps {
  nodes: GraphNode[]
  result: PathResult | null
  source: string
  target: string
  onSourceChange: (nodeId: string) => void
  onTargetChange: (nodeId: string) => void
  onFindPath: () => void
  children?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveNodeName(nodes: GraphNode[], id: string): string {
  const node = nodes.find((n) => n.id === id)
  return node ? node.name : id
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MigrationResults({
  nodes,
  result,
  source,
  target,
  onSourceChange,
  onTargetChange,
  onFindPath,
  children
}: MigrationResultsProps) {
  const { t } = useLanguage()

  // -- Sorted alternatives by effort ascending --------------------------------
  const sortedAlternatives = useMemo(() => {
    if (!result?.alternatives || result.alternatives.length === 0) return []
    return [...result.alternatives].sort((a, b) => a.totalEffort - b.totalEffort)
  }, [result])

  // -- Validation states ------------------------------------------------------
  const hasNodes = nodes.length > 0
  const sameSourceTarget = source !== '' && target !== '' && source === target
  const canFindPath = hasNodes && source !== '' && target !== '' && !sameSourceTarget

  // -- No-path detection: result exists but path is empty ---------------------
  const isNoPath = result !== null && result.path.length === 0
  const hasResult = result !== null && result.path.length > 0

  // -- Empty state: no nodes --------------------------------------------------
  if (!hasNodes) {
    return (
      <div className={styles.container}>
        <section className={styles.sectionCard} aria-labelledby="migration-results-heading">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle} id="migration-results-heading">
              {t('tab3.pathfindingResultsTitle')}
            </h3>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.placeholder}>{t('tab3.addVariationsToBegin')}</p>
          </div>
        </section>
      </div>
    )
  }

  // -- Render -----------------------------------------------------------------
  return (
    <div className={styles.container}>
      {/* Source / Target selectors + Find button */}
      <section className={styles.sectionCard} aria-labelledby="path-selector-heading">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle} id="path-selector-heading">
            {t('tab3.pathfindingResultsTitle')}
          </h3>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.selectorRow}>
            <div className={styles.field}>
              <label htmlFor="path-source" className={styles.fieldLabel}>
                {t('common.source')}
              </label>
              <select
                id="path-source"
                className={styles.select}
                value={source}
                onChange={(e) => onSourceChange(e.target.value)}
              >
                <option value="">{t('common.selectSource')}</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="path-target" className={styles.fieldLabel}>
                {t('common.target')}
              </label>
              <select
                id="path-target"
                className={styles.select}
                value={target}
                onChange={(e) => onTargetChange(e.target.value)}
              >
                <option value="">{t('common.selectTarget')}</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldAction}>
              <button type="button" className={styles.findButton} disabled={!canFindPath} onClick={onFindPath}>
                {t('tab3.findOptimalPath')}
              </button>
            </div>
          </div>

          {/* Validation messages */}
          {sameSourceTarget && (
            <p className={styles.warning} role="alert">
              {t('tab3.sourceAndTargetMustBeDifferent')}
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      <section className={styles.sectionCard} aria-labelledby="results-heading">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle} id="results-heading">
            {t('tab3.resultsTitle')}
          </h3>
        </div>
        <div className={styles.sectionBody}>
          {/* Not yet calculated */}
          {result === null && <p className={styles.placeholder}>{t('tab3.selectSourceAndTarget')}</p>}

          {/* No path exists */}
          {isNoPath && (
            <div className={styles.noPath} role="alert">
              <span className={styles.warningIcon} aria-hidden="true">
                &#9888;
              </span>
              <span>
                No path exists from <strong>{resolveNodeName(nodes, source)}</strong> to{' '}
                <strong>{resolveNodeName(nodes, target)}</strong>
              </span>
            </div>
          )}

          {/* Optimal path found */}
          {hasResult && (
            <>
              {/* Optimal path heading */}
              <div className={styles.optimalHeader}>
                <h4 className={styles.optimalTitle}>{t('tab3.optimalPath')}</h4>
                <p className={styles.optimalPath}>
                  {result.path.map((id) => resolveNodeName(nodes, id)).join(' \u2192 ')}
                </p>
              </div>

              {/* Total effort */}
              <div className={styles.totalEffort}>
                <span className={styles.totalEffortLabel}>{t('tab3.totalEffort')}</span>
                <span className={styles.totalEffortValue}>{result.totalEffort.toFixed(1)}</span>
              </div>

              {/* Steps */}
              <div className={styles.stepsSection}>
                <h4 className={styles.stepsTitle}>{t('tab3.steps')}</h4>
                <ol className={styles.stepsList}>
                  {result.steps.map((step, index) => (
                    <li key={`${step.from}-${step.to}`} className={styles.stepItem}>
                      <span className={styles.stepNumber}>{index + 1}.</span>
                      <span className={styles.stepRoute}>
                        {resolveNodeName(nodes, step.from)} &rarr; {resolveNodeName(nodes, step.to)}
                      </span>
                      <span className={styles.stepEffort}>
                        {t('common.effort')}: {step.effort.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Alternative paths */}
              <div className={styles.alternativesSection}>
                <h4 className={styles.alternativesTitle}>{t('tab3.alternativePaths')}</h4>
                {sortedAlternatives.length === 0 ? (
                  <p className={styles.noAlternatives}>{t('tab3.noAlternativePaths')}</p>
                ) : (
                  <ul className={styles.alternativesList}>
                    {sortedAlternatives.map((alt) => {
                      const key = alt.path.join('-')
                      return (
                        <li key={key} className={styles.alternativeItem}>
                          <span className={styles.alternativePath}>
                            {alt.path.map((id) => resolveNodeName(nodes, id)).join(' \u2192 ')}
                          </span>
                          <span className={styles.alternativeEffort}>
                            {t('common.effort')}: {alt.totalEffort.toFixed(1)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <hr className={styles.divider} />
            </>
          )}

          {/* Additional content (e.g. Graph Visualization) */}
          {children}
        </div>
      </section>
    </div>
  )
}
