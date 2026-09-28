'use client'

import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_COMPONENT_WEIGHTS } from '../data/default-component-weights'
import { DEFAULT_HARDWARE_DATA } from '../data/default-hardware-configurations'
import { DEFAULT_CLASSICAL_CQRS_METRICS, DEFAULT_MCQRS_METRICS } from '../data/default-params'
import { DEFAULT_QUALITY_ATTRIBUTES } from '../data/default-quality-attributes'
import { DEFAULT_SLA_PARAMETERS } from '../data/default-sla-parameters'
import type { ValidationError } from '../lib/validation/types'
import { computeRelativeComplexity, toRCResults } from '../lib/variation-selection/applicability'
import {
  buildDefaultComponentWeights,
  syncComponentWeightsWithAttributes
} from '../lib/variation-selection/component-weights'
import { syncHardwareWithVariations } from '../lib/variation-selection/hardware-sync'
import { getAllMetricKeys, validateAttributesParamsMetrics } from '../lib/variation-selection/quality-attributes'
import { computeOptimalVariation, computeRelativeHostingPrice } from '../lib/variation-selection/selection'
import type {
  ApplicabilityResult,
  ComponentWeights,
  OptimalResult,
  QualityAttribute,
  RelativeComplexityResult,
  RelativeHostingPriceResult,
  SlaParameter,
  VariationHardwareData,
  VariationMetrics
} from '../lib/variation-selection/types'
import { findInvalidWeightAttributes, validateSelectionInputs } from '../lib/variation-selection/validation'

export interface VariationData {
  name: string
  metrics: Record<string, number>
}

export interface ResultsState {
  applicability: ApplicabilityResult[]
  relativeComplexity: RelativeComplexityResult[]
  optimal: OptimalResult[]
  relativeHostingPrice: RelativeHostingPriceResult[]
}

const DEFAULT_VARIATIONS: VariationData[] = [
  { name: 'Classical CQRS', metrics: { ...DEFAULT_CLASSICAL_CQRS_METRICS } },
  { name: 'mCQRS', metrics: { ...DEFAULT_MCQRS_METRICS } }
]

/**
 * Owns the state and orchestration for the Variation Selection tab: quality
 * attributes, variation metrics, component weights, SLA parameters, hardware
 * data, swp, validation, and the optimal-variation calculation. All domain
 * rules live in src/lib/variation-selection.
 */
export function useVariationSelection() {
  const [attributes, setAttributes] = useState<QualityAttribute[]>(() => [...DEFAULT_QUALITY_ATTRIBUTES])
  const [variations, setVariations] = useState<VariationData[]>(() => DEFAULT_VARIATIONS)
  const [componentWeights, setComponentWeights] = useState<ComponentWeights>(() =>
    buildDefaultComponentWeights(DEFAULT_QUALITY_ATTRIBUTES, DEFAULT_COMPONENT_WEIGHTS)
  )
  const [slaParameters, setSlaParameters] = useState<SlaParameter[]>(() => [...DEFAULT_SLA_PARAMETERS])
  const [hardwareData, setHardwareData] = useState<VariationHardwareData[]>(() =>
    DEFAULT_HARDWARE_DATA.map((b) => ({
      ...b,
      configs: b.configs.map((c) => ({ ...c, slaValues: { ...c.slaValues } }))
    }))
  )
  const [swp, setSwp] = useState<number>(100)
  const [results, setResults] = useState<ResultsState | null>(null)

  const metricKeys = useMemo(() => getAllMetricKeys(attributes), [attributes])

  const metricKeyLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    for (const attr of attributes) {
      if (attr.enabled) labels[attr.metricKey] = attr.name
    }
    return labels
  }, [attributes])

  const activeAttributes = useMemo(() => attributes.filter((attr) => attr.enabled), [attributes])

  const validationErrors: ValidationError[] = useMemo(
    () =>
      validateAttributesParamsMetrics(
        attributes,
        variations.map((v) => ({ name: v.name, metrics: v.metrics }))
      ),
    [attributes, variations]
  )

  const invalidWeightAttributes = useMemo(
    () => findInvalidWeightAttributes(attributes, componentWeights),
    [attributes, componentWeights]
  )

  const isValid = useMemo(
    () =>
      validateSelectionInputs({
        attributes,
        variations: variations.map((v) => ({ name: v.name, metrics: v.metrics })),
        componentWeights,
        swp
      }).length === 0,
    [attributes, variations, componentWeights, swp]
  )

  const handleAttributesChange = useCallback((next: QualityAttribute[]) => {
    setAttributes(next)
    setComponentWeights((prev) => syncComponentWeightsWithAttributes(prev, next, DEFAULT_COMPONENT_WEIGHTS))
    setResults(null)
  }, [])

  const handleVariationsChange = useCallback(
    (next: VariationData[]) => {
      setVariations(next)
      setHardwareData((prev) =>
        syncHardwareWithVariations(
          prev,
          next.map((v) => v.name),
          slaParameters
        )
      )
      setResults(null)
    },
    [slaParameters]
  )

  const handleSlaParametersChange = useCallback(
    (next: SlaParameter[]) => {
      setSlaParameters(next)
      setHardwareData((prev) =>
        syncHardwareWithVariations(
          prev,
          variations.map((v) => v.name),
          next
        )
      )
      setResults(null)
    },
    [variations]
  )

  const handleHardwareDataChange = useCallback((next: VariationHardwareData[]) => {
    setHardwareData(next)
    setResults(null)
  }, [])

  const handleSwpChange = useCallback((next: number) => {
    setSwp(next)
    setResults(null)
  }, [])

  const handleComponentWeightTemplateChange = useCallback((metricKey: string, template: string) => {
    setComponentWeights((prev) => {
      const existing = prev[metricKey] ?? { template: 'value', value: 1 }
      return { ...prev, [metricKey]: { template, value: existing.value } }
    })
    setResults(null)
  }, [])

  const handleComponentWeightValueChange = useCallback((metricKey: string, value: number) => {
    const safeValue = Number.isNaN(value) ? 0 : value
    setComponentWeights((prev) => {
      const existing = prev[metricKey] ?? { template: 'value', value: 1 }
      return { ...prev, [metricKey]: { template: existing.template, value: safeValue } }
    })
    setResults(null)
  }, [])

  const handleCalculate = useCallback(() => {
    if (!isValid) return

    const variationMetrics: VariationMetrics[] = variations.map((v) => ({ name: v.name, metrics: v.metrics }))

    const flatWeights: Record<string, number> = {}
    for (const [key, w] of Object.entries(componentWeights)) {
      flatWeights[key] = w.value
    }

    const relativeComplexity = computeRelativeComplexity(flatWeights, variationMetrics, metricKeys)
    const applicability = toRCResults(relativeComplexity)
    const optimal = computeOptimalVariation(relativeComplexity, hardwareData, slaParameters, swp)
    const relativeHostingPrice = computeRelativeHostingPrice(optimal)

    setResults({ applicability, relativeComplexity, optimal, relativeHostingPrice })
  }, [isValid, variations, componentWeights, metricKeys, hardwareData, slaParameters, swp])

  return {
    attributes,
    variations,
    componentWeights,
    slaParameters,
    hardwareData,
    swp,
    results,
    metricKeys,
    metricKeyLabels,
    activeAttributes,
    validationErrors,
    invalidWeightAttributes,
    isValid,
    handleAttributesChange,
    handleVariationsChange,
    handleSlaParametersChange,
    handleHardwareDataChange,
    handleSwpChange,
    handleComponentWeightTemplateChange,
    handleComponentWeightValueChange,
    handleCalculate
  }
}
