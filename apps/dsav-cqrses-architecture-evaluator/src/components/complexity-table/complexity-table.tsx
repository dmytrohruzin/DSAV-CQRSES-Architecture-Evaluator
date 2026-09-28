'use client'

import { type FormEvent, useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import { validationMessage } from '../../i18n/validation-messages'
import type { Activity, Component, ComponentComplexityRow } from '../../lib/classification/types'
import { isNonNegativeFinite } from '../../lib/validation/validators'
import { DecimalInput } from '../decimal-input/decimal-input'
import styles from './complexity-table.module.css'

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ComplexityTableProps {
  components: Component[]
  onComponentsChange: (components: Component[]) => void
  designMaxValue: number
  realizationMaxValue: number
  designWeight: number
  realizationWeight: number
  /** Pre-computed classification rows (one per component), owned by the hook. */
  results: ComponentComplexityRow[]
  onSettingsChange: (settings: { designMaxValue: number; realizationMaxValue: number }) => void
  onWeightsChange: (weights: { designWeight: number; realizationWeight: number }) => void
  /** Auto-derive axis maximums from the current activity values. */
  onAutoCalcMax: () => void
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** UI tolerance for the design+realization weight sum check. */
const WEIGHT_SUM_TOLERANCE = 0.001

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ComplexityTable({
  components,
  onComponentsChange,
  designMaxValue,
  realizationMaxValue,
  designWeight,
  realizationWeight,
  results,
  onSettingsChange,
  onWeightsChange,
  onAutoCalcMax
}: ComplexityTableProps) {
  const { t } = useLanguage()
  const [newComponentName, setNewComponentName] = useState('')
  const [nameError, setNameError] = useState(false)

  // --- Settings validation ---

  const isDesignMaxInvalid = designMaxValue <= 0
  const isRealizationMaxInvalid = realizationMaxValue <= 0
  const isWeightSumInvalid = Math.abs(designWeight + realizationWeight - 1) > WEIGHT_SUM_TOLERANCE

  const handleDesignMaxChange = useCallback(
    (value: number) => {
      onSettingsChange({ designMaxValue: value, realizationMaxValue })
    },
    [realizationMaxValue, onSettingsChange]
  )

  const handleRealizationMaxChange = useCallback(
    (value: number) => {
      onSettingsChange({ designMaxValue, realizationMaxValue: value })
    },
    [designMaxValue, onSettingsChange]
  )

  const handleDesignWeightChange = useCallback(
    (value: number) => {
      onWeightsChange({ designWeight: value, realizationWeight })
    },
    [realizationWeight, onWeightsChange]
  )

  const handleRealizationWeightChange = useCallback(
    (value: number) => {
      onWeightsChange({ designWeight, realizationWeight: value })
    },
    [designWeight, onWeightsChange]
  )

  // --- Mutation helpers (immutable updates) ---

  const updateActivity = useCallback(
    (compIdx: number, actIdx: number, field: keyof Activity, value: string | number) => {
      const next = components.map((comp, ci) => {
        if (ci !== compIdx) return comp
        return {
          ...comp,
          activities: comp.activities.map((act, ai) => {
            if (ai !== actIdx) return act
            if (field === 'name') {
              return { ...act, name: value as string }
            }
            const parsed = typeof value === 'number' ? value : Number.parseFloat(value) || 0
            return { ...act, [field]: parsed }
          })
        }
      })
      onComponentsChange(next)
    },
    [components, onComponentsChange]
  )

  const removeActivity = useCallback(
    (compIdx: number, actIdx: number) => {
      const next = components.map((comp, ci) => {
        if (ci !== compIdx) return comp
        return {
          ...comp,
          activities: comp.activities.filter((_, ai) => ai !== actIdx)
        }
      })
      onComponentsChange(next)
    },
    [components, onComponentsChange]
  )

  const addActivity = useCallback(
    (compIdx: number) => {
      const blank: Activity = { name: 'New activity', designComplexity: 0, realizationComplexity: 0 }
      const next = components.map((comp, ci) => {
        if (ci !== compIdx) return comp
        return { ...comp, activities: [...comp.activities, blank] }
      })
      onComponentsChange(next)
    },
    [components, onComponentsChange]
  )

  const removeComponent = useCallback(
    (compIdx: number) => {
      onComponentsChange(components.filter((_, ci) => ci !== compIdx))
    },
    [components, onComponentsChange]
  )

  const addComponent = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = newComponentName.trim()
      if (!trimmed) {
        setNameError(true)
        return
      }
      setNameError(false)
      onComponentsChange([...components, { name: trimmed, activities: [] }])
      setNewComponentName('')
    },
    [components, newComponentName, onComponentsChange]
  )

  // --- Render ---

  return (
    <div className={styles.container}>
      {/* Classificator settings panel */}
      <section className={styles.settingsPanel} aria-label={t('tab1.classificatorSettings')}>
        <span className={styles.settingsTitle}>{t('tab1.classificatorSettings')}</span>
        <div className={styles.settingsFields}>
          <div className={styles.settingsField}>
            <label htmlFor="design-weight" className={styles.settingsLabel}>
              {t('tab1.designWeight')}
            </label>
            <DecimalInput
              id="design-weight"
              className={styles.settingsInput}
              value={designWeight}
              onChange={handleDesignWeightChange}
              aria-label={t('tab1.designWeight')}
            />
          </div>
          <div className={styles.settingsField}>
            <label htmlFor="realization-weight" className={styles.settingsLabel}>
              {t('tab1.realizationWeight')}
            </label>
            <DecimalInput
              id="realization-weight"
              className={styles.settingsInput}
              value={realizationWeight}
              onChange={handleRealizationWeightChange}
              aria-label={t('tab1.realizationWeight')}
            />
          </div>
          {isWeightSumInvalid && (
            <span className={styles.settingsError} role="alert">
              &#9888; {t('tab1.weightsSumMustBeOne')} ({(designWeight + realizationWeight).toFixed(2)})
            </span>
          )}
        </div>
        <div className={styles.settingsFields}>
          <div className={styles.settingsField}>
            <label htmlFor="design-max-value" className={styles.settingsLabel}>
              {t('tab1.designMaxValue')}
            </label>
            <DecimalInput
              id="design-max-value"
              className={`${styles.settingsInput} ${isDesignMaxInvalid ? styles.settingsInputError : ''}`}
              value={designMaxValue}
              onChange={handleDesignMaxChange}
              aria-label={t('tab1.designMaxValue')}
              aria-invalid={isDesignMaxInvalid}
            />
            {isDesignMaxInvalid && (
              <span className={styles.settingsError} role="alert">
                {t('common.mustBeGreaterThanZero')}
              </span>
            )}
          </div>
          <div className={styles.settingsField}>
            <label htmlFor="realization-max-value" className={styles.settingsLabel}>
              {t('tab1.realizationMaxValue')}
            </label>
            <DecimalInput
              id="realization-max-value"
              className={`${styles.settingsInput} ${isRealizationMaxInvalid ? styles.settingsInputError : ''}`}
              value={realizationMaxValue}
              onChange={handleRealizationMaxChange}
              aria-label={t('tab1.realizationMaxValue')}
              aria-invalid={isRealizationMaxInvalid}
            />
            {isRealizationMaxInvalid && (
              <span className={styles.settingsError} role="alert">
                {t('common.mustBeGreaterThanZero')}
              </span>
            )}
          </div>
          <button type="button" className={styles.autoCalcButton} onClick={onAutoCalcMax}>
            {t('tab1.autoCalcMaxValues')}
          </button>
        </div>
      </section>

      {components.map((comp, compIdx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: components lack stable IDs; index combined with name
        <details key={`comp-${comp.name}-${compIdx}`} className={styles.card} open>
          {/* Card header */}
          <summary className={styles.cardHeader}>
            <span className={styles.chevron} />
            <span className={styles.cardTitle}>
              {t('tab1.componentLabel')} {comp.name}
            </span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.preventDefault()
                removeComponent(compIdx)
              }}
              aria-label={`Remove component ${comp.name}`}
              title={t('tab1.removeComponent')}
            >
              &times;
            </button>
          </summary>

          {/* Card body — activity table */}
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('tab1.activityColumn')}</th>
                  <th>{t('tab1.designComplexityColumn')}</th>
                  <th>{t('tab1.realizationComplexityColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {comp.activities.map((act, actIdx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: activities lack stable IDs
                  <tr key={`act-${actIdx}`} className={styles.activityRow}>
                    {/* Activity name */}
                    <td>
                      <div className={styles.activityNameCell}>
                        <input
                          type="text"
                          className={styles.activityNameInput}
                          value={act.name}
                          onChange={(e) => updateActivity(compIdx, actIdx, 'name', e.target.value)}
                          aria-label={`Activity name for ${comp.name} row ${actIdx + 1}`}
                        />
                        <button
                          type="button"
                          className={styles.removeActivityButton}
                          onClick={() => removeActivity(compIdx, actIdx)}
                          aria-label={`Remove activity ${act.name}`}
                          title={t('tab1.removeActivity')}
                        >
                          &times;
                        </button>
                      </div>
                    </td>

                    {/* Design complexity */}
                    <td>
                      <DecimalInput
                        className={`${styles.numberInput} ${isNonNegativeFinite(act.designComplexity) ? '' : styles.numberInputError}`}
                        value={act.designComplexity}
                        onChange={(v) => updateActivity(compIdx, actIdx, 'designComplexity', v)}
                        aria-label={`Design complexity for ${act.name}`}
                        aria-invalid={!isNonNegativeFinite(act.designComplexity)}
                      />
                    </td>

                    {/* Realization complexity */}
                    <td>
                      <DecimalInput
                        className={`${styles.numberInput} ${isNonNegativeFinite(act.realizationComplexity) ? '' : styles.numberInputError}`}
                        value={act.realizationComplexity}
                        onChange={(v) => updateActivity(compIdx, actIdx, 'realizationComplexity', v)}
                        aria-label={`Realization complexity for ${act.name}`}
                        aria-invalid={!isNonNegativeFinite(act.realizationComplexity)}
                      />
                    </td>
                  </tr>
                ))}
                {/* Summary rows — fuzzy classification */}
                {results[compIdx] != null && results[compIdx].errors.length > 0 && (
                  <tr className={styles.errorRow}>
                    <td colSpan={3} className={styles.errorLabel} role="alert">
                      &#9888; {results[compIdx].errors.map((error) => validationMessage(error, t)).join(', ')}
                    </td>
                  </tr>
                )}
                {results[compIdx] != null && results[compIdx].errors.length === 0 && (
                  <>
                    <tr className={styles.summaryRow}>
                      <td className={styles.summaryLabel}>{t('tab1.classValueFuzzy')}</td>
                      <td className={styles.summaryValue}>{results[compIdx].designClass.toFixed(2)}</td>
                      <td className={styles.summaryValue}>{results[compIdx].realizationClass.toFixed(2)}</td>
                    </tr>
                    <tr className={styles.totalRow}>
                      <td colSpan={3} className={styles.totalLabel}>
                        {t('tab1.componentTotal')} {designWeight} &times; {results[compIdx].designClass.toFixed(2)} +
                        {realizationWeight} &times; {results[compIdx].realizationClass.toFixed(2)} ={' '}
                        <strong>{results[compIdx].total.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            <button type="button" className={styles.addActivityButton} onClick={() => addActivity(compIdx)}>
              {t('tab1.addActivity')}
            </button>
          </div>
        </details>
      ))}

      {/* Add Component section */}
      <section className={styles.addComponentSection} aria-label={t('tab1.addComponent')}>
        <span className={styles.addComponentTitle}>{t('tab1.addComponent')}</span>
        <form className={styles.addComponentForm} onSubmit={addComponent}>
          <div className={styles.addComponentField}>
            <label htmlFor="new-component-name" className={styles.addComponentLabel}>
              {t('common.name')}
            </label>
            <input
              id="new-component-name"
              type="text"
              className={`${styles.addComponentInput} ${nameError ? styles.addComponentInputError : ''}`}
              value={newComponentName}
              onChange={(e) => {
                setNewComponentName(e.target.value)
                if (nameError) setNameError(false)
              }}
              placeholder={t('tab1.componentNamePlaceholder')}
              aria-invalid={nameError}
            />
          </div>
          <button type="submit" className={styles.addButton}>
            {t('common.add')}
          </button>
        </form>
      </section>
    </div>
  )
}
