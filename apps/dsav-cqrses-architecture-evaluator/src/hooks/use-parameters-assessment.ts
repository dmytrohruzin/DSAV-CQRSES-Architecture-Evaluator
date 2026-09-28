import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_COMPLEXITY_COMPONENTS } from '../data/default-complexity-data'
import { DEFAULT_PERFORMANCE_METRICS, DEFAULT_PERFORMANCE_SCALE } from '../data/default-performance-data'
import { DEFAULT_CLASSIFICATOR_SETTINGS } from '../lib/classification/classificator'
import { computeComponentComplexity, computeMaxComplexitySettings } from '../lib/classification/component-complexity'
import type { Component } from '../lib/classification/types'
import type { PerformanceMetric, PerformanceScale } from '../lib/performance/types'

/**
 * Owns all state and handlers for the Parameters Assessment tab: complexity
 * evaluation (components, classificator settings, weights) and performance
 * evaluation (scale, metrics). All calculations live in src/lib.
 */
export function useParametersAssessment() {
  // -- Section 1 state -------------------------------------------------------
  const [components, setComponents] = useState<Component[]>(DEFAULT_COMPLEXITY_COMPONENTS)
  const [designMaxValue, setDesignMaxValue] = useState(DEFAULT_CLASSIFICATOR_SETTINGS.designMaxValue)
  const [realizationMaxValue, setRealizationMaxValue] = useState(DEFAULT_CLASSIFICATOR_SETTINGS.realizationMaxValue)
  const [designWeight, setDesignWeight] = useState(0.5)
  const [realizationWeight, setRealizationWeight] = useState(0.5)

  // -- Section 2 state -------------------------------------------------------
  const [performanceScale, setPerformanceScale] = useState<PerformanceScale[]>(DEFAULT_PERFORMANCE_SCALE)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>(DEFAULT_PERFORMANCE_METRICS)

  // -- Computed: complexity results ------------------------------------------
  const complexityResults = useMemo(
    () =>
      computeComponentComplexity(
        components,
        { designMaxValue, realizationMaxValue },
        { designWeight, realizationWeight }
      ),
    [components, designMaxValue, realizationMaxValue, designWeight, realizationWeight]
  )

  // -- Settings change handlers ----------------------------------------------
  const handleSettingsChange = useCallback((settings: { designMaxValue: number; realizationMaxValue: number }) => {
    setDesignMaxValue(settings.designMaxValue)
    setRealizationMaxValue(settings.realizationMaxValue)
  }, [])

  const handleWeightsChange = useCallback((weights: { designWeight: number; realizationWeight: number }) => {
    setDesignWeight(weights.designWeight)
    setRealizationWeight(weights.realizationWeight)
  }, [])

  const handleAutoCalcMaxValues = useCallback(() => {
    const next = computeMaxComplexitySettings(components)
    setDesignMaxValue(next.designMaxValue)
    setRealizationMaxValue(next.realizationMaxValue)
  }, [components])

  return {
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
  }
}
