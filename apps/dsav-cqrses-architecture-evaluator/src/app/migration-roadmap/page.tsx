'use client'

import { FeasibilityAssessment } from '../../components/feasibility-assessment/feasibility-assessment'
import { GraphEditor } from '../../components/graph-editor/graph-editor'
import { GraphVisualizer } from '../../components/graph-visualizer/graph-visualizer'
import { MigrationResults } from '../../components/migration-results/migration-results'
import { useMigrationRoadmap } from '../../hooks/use-migration-roadmap'
import { useLanguage } from '../../i18n/language-context'
import styles from './page.module.css'

export default function MigrationRoadmap() {
  const { t } = useLanguage()

  const {
    nodes,
    edges,
    source,
    target,
    result,
    highlightedPath,
    sourceNode,
    targetNode,
    allPaths,
    handleNodesChange,
    handleEdgesChange,
    handleSourceChange,
    handleTargetChange,
    handleFindPath
  } = useMigrationRoadmap()

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t('tab3.heading')}</h2>
      <p className={styles.description}>{t('tab3.description')}</p>

      <GraphEditor nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange} />

      <MigrationResults
        nodes={nodes}
        result={result}
        source={source}
        target={target}
        onSourceChange={handleSourceChange}
        onTargetChange={handleTargetChange}
        onFindPath={handleFindPath}
      >
        <GraphVisualizer nodes={nodes} edges={edges} highlightedPath={highlightedPath} />
      </MigrationResults>

      <FeasibilityAssessment source={sourceNode} target={targetNode} paths={allPaths} />

      {result !== null && result.path.length === 0 && (
        <div className={styles.noPathCard} role="alert">
          <span className={styles.warningIcon} aria-hidden="true">
            &#9888;
          </span>
          <span>
            {t('tab3.noPathExists')}: {nodes.find((n) => n.id === source)?.name ?? source} {' → '}
            {nodes.find((n) => n.id === target)?.name ?? target}
          </span>
        </div>
      )}
    </div>
  )
}
