'use client'

import { ComplexityResults } from '../../components/complexity-results/complexity-results'
import { ComplexityTable } from '../../components/complexity-table/complexity-table'
import { PerformanceEvaluation } from '../../components/performance-evaluation/performance-evaluation'
import { useParametersAssessment } from '../../hooks/use-parameters-assessment'
import { useLanguage } from '../../i18n/language-context'
import styles from './page.module.css'

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ParametersAssessment() {
  const { t } = useLanguage()

  const {
    components,
    setComponents,
    designMaxValue,
    realizationMaxValue,
    designWeight,
    realizationWeight,
    performanceScale,
    setPerformanceScale,
    performanceMetrics,
    setPerformanceMetrics,
    complexityResults,
    handleSettingsChange,
    handleWeightsChange,
    handleAutoCalcMaxValues
  } = useParametersAssessment()

  // -- Render ----------------------------------------------------------------
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t('tab1.heading')}</h2>
      <p className={styles.description}>{t('tab1.description')}</p>

      {/* Section 1: Complexity Evaluation */}
      <section className={styles.section} aria-labelledby="complexity-heading">
        <h2 className={styles.sectionTitle} id="complexity-heading">
          {t('tab1.complexityEvaluationTitle')}
        </h2>
        <p className={styles.sectionDescription}>{t('tab1.complexityEvaluationDescription')}</p>

        <ComplexityTable
          components={components}
          onComponentsChange={setComponents}
          designMaxValue={designMaxValue}
          realizationMaxValue={realizationMaxValue}
          designWeight={designWeight}
          realizationWeight={realizationWeight}
          results={complexityResults}
          onSettingsChange={handleSettingsChange}
          onWeightsChange={handleWeightsChange}
          onAutoCalcMax={handleAutoCalcMaxValues}
        />

        {/* Divider */}
        <hr className={styles.divider} />

        <ComplexityResults results={complexityResults} designMaxValue={designMaxValue} />
      </section>

      {/* Section 2: Performance Evaluation */}
      <section className={styles.section} aria-labelledby="performance-heading">
        <h2 className={styles.sectionTitle} id="performance-heading">
          {t('tab1.performanceEvaluationTitle')}
        </h2>
        <p className={styles.sectionDescription}>{t('tab1.performanceEvaluationDescription')}</p>

        <PerformanceEvaluation
          scale={performanceScale}
          onScaleChange={setPerformanceScale}
          metrics={performanceMetrics}
          onMetricsChange={setPerformanceMetrics}
        />
      </section>
    </div>
  )
}
