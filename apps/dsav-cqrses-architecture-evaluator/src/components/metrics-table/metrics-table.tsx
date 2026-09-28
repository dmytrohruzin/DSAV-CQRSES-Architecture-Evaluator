'use client'

import { type FormEvent, useCallback, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import { DecimalInput } from '../decimal-input/decimal-input'
import styles from './metrics-table.module.css'

interface MetricsTableProps {
  metricKeys: string[]
  metricKeyLabels?: Record<string, string>
  variations: Array<{ name: string; metrics: Record<string, number> }>
  onVariationsChange: (variations: MetricsTableProps['variations']) => void
}

function isValidMetric(value: number | undefined): boolean {
  if (value === undefined) return false
  if (Number.isNaN(value)) return false
  return value > 0
}

export function MetricsTable({ metricKeys, metricKeyLabels, variations, onVariationsChange }: MetricsTableProps) {
  const { t } = useLanguage()
  const [newName, setNewName] = useState('')
  const [formError, setFormError] = useState('')

  const validationWarnings = useMemo(() => {
    const warnings: string[] = []
    for (const variation of variations) {
      for (const key of metricKeys) {
        const value = variation.metrics[key]
        if (value === undefined || Number.isNaN(value)) {
          warnings.push(`${variation.name}: ${key} ${t('tab2.metricRequired')}`)
        } else if (value <= 0) {
          warnings.push(`${variation.name}: ${key} ${t('tab2.metricMustBePositive')}`)
        }
      }
    }
    return warnings
  }, [variations, metricKeys, t])

  const handleCellChange = useCallback(
    (variationIndex: number, metricKey: string, value: number) => {
      const next = variations.map((v, i) => {
        if (i !== variationIndex) return v
        const updated = { ...v, metrics: { ...v.metrics } }
        updated.metrics[metricKey] = value
        return updated
      })
      onVariationsChange(next)
    },
    [variations, onVariationsChange]
  )

  const handleRemoveVariation = useCallback(
    (index: number) => {
      onVariationsChange(variations.filter((_, i) => i !== index))
    },
    [variations, onVariationsChange]
  )

  const handleAddVariation = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = newName.trim()

      if (!trimmed) {
        setFormError(t('tab2.variationNameEmpty'))
        return
      }

      const isDuplicate = variations.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())
      if (isDuplicate) {
        setFormError(`"${trimmed}" ${t('common.alreadyExists')}`)
        return
      }

      setFormError('')
      const emptyMetrics: Record<string, number> = {}
      for (const key of metricKeys) {
        emptyMetrics[key] = Number.NaN
      }
      onVariationsChange([...variations, { name: trimmed, metrics: emptyMetrics }])
      setNewName('')
    },
    [newName, variations, metricKeys, onVariationsChange, t]
  )

  return (
    <div className={styles.container}>
      {/* Desktop table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label="Variation metrics">
          <thead>
            <tr>
              <th className={styles.cornerCell}>{t('tab2.qualityAttributeComponent')}</th>
              {variations.map((variation, vIdx) => (
                <th key={variation.name} className={styles.variationHeader}>
                  <span className={styles.variationName}>{variation.name}</span>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveVariation(vIdx)}
                    aria-label={`Remove ${variation.name}`}
                  >
                    &times;
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricKeys.map((key) => (
              <tr key={key} className={styles.metricRow}>
                <td className={styles.metricLabel}>{metricKeyLabels?.[key] ?? key}</td>
                {variations.map((variation, vIdx) => {
                  const value = variation.metrics[key]
                  const valid = isValidMetric(value)
                  return (
                    <td key={variation.name} className={styles.metricCell}>
                      <DecimalInput
                        value={value === undefined ? Number.NaN : value}
                        onChange={(v) => handleCellChange(vIdx, key, v)}
                        className={`${styles.metricInput} ${!valid ? styles.metricInputError : ''}`}
                        min={0}
                        aria-label={`${key} for ${variation.name}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className={styles.mobileCards}>
        {variations.map((variation, vIdx) => (
          <div key={variation.name} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{variation.name}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveVariation(vIdx)}
                aria-label={`Remove ${variation.name}`}
              >
                &times;
              </button>
            </div>

            <div className={styles.cardGroup}>
              {metricKeys.map((key) => {
                const value = variation.metrics[key]
                const valid = isValidMetric(value)
                return (
                  <div key={key} className={styles.cardRow}>
                    <label className={styles.cardLabel} htmlFor={`mobile-${variation.name}-${key}`}>
                      {metricKeyLabels?.[key] ?? key}
                    </label>
                    <DecimalInput
                      id={`mobile-${variation.name}-${key}`}
                      value={value === undefined ? Number.NaN : value}
                      onChange={(v) => handleCellChange(vIdx, key, v)}
                      className={`${styles.metricInput} ${!valid ? styles.metricInputError : ''}`}
                      min={0}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {validationWarnings.length > 0 && (
        <div className={styles.validationPanel} role="alert">
          <span className={styles.validationIcon}>&#9888;</span>
          <div className={styles.validationList}>
            {validationWarnings.map((warning) => (
              <span key={warning} className={styles.validationItem}>
                {warning}
              </span>
            ))}
          </div>
        </div>
      )}

      {validationWarnings.length === 0 && variations.length > 0 && (
        <div className={styles.validationPanelOk}>
          <span className={styles.validationOkLine}>&#10003; {t('tab2.allValuesPositive')}</span>
        </div>
      )}

      <section className={styles.addSection} aria-label={t('tab2.addVariation')}>
        <span className={styles.addTitle}>{t('tab2.addVariation')}</span>
        <form className={styles.addForm} onSubmit={handleAddVariation}>
          <div className={styles.addField}>
            <label htmlFor="new-variation-name" className={styles.addLabel}>
              {t('common.name')}
            </label>
            <input
              id="new-variation-name"
              type="text"
              className={`${styles.addInput} ${formError ? styles.addInputError : ''}`}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                if (formError) setFormError('')
              }}
              placeholder={t('tab2.variationNamePlaceholder')}
            />
          </div>
          <button type="submit" className={styles.addButton}>
            {t('common.add')}
          </button>
        </form>
        {formError && (
          <span className={styles.formError} role="alert">
            {formError}
          </span>
        )}
        <span className={styles.addHint}>{t('tab2.addVariationHint')}</span>
      </section>
    </div>
  )
}
