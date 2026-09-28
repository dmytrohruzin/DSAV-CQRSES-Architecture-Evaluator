'use client'

import { type FormEvent, useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import type { SlaDirection, SlaParameter } from '../../lib/variation-selection/types'
import { DecimalInput } from '../decimal-input/decimal-input'
import styles from './sla-parameters.module.css'

interface SlaParametersProps {
  parameters: SlaParameter[]
  onParametersChange: (next: SlaParameter[]) => void
}

function toSlugId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `sla-${Math.random().toString(36).slice(2, 8)}`
}

export function SlaParameters({ parameters, onParametersChange }: SlaParametersProps) {
  const { t } = useLanguage()

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('ms')
  const [newDirection, setNewDirection] = useState<SlaDirection>('less-better')
  const [newThreshold, setNewThreshold] = useState<number>(Number.NaN)
  const [formError, setFormError] = useState('')

  const handleField = useCallback(
    (id: string, patch: Partial<SlaParameter>) => {
      onParametersChange(parameters.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    },
    [parameters, onParametersChange]
  )

  const handleRemove = useCallback(
    (id: string) => {
      onParametersChange(parameters.filter((p) => p.id !== id))
    },
    [parameters, onParametersChange]
  )

  const handleAdd = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = newName.trim()
      if (!trimmed) {
        setFormError(t('tab2.slaNameRequired'))
        return
      }
      if (parameters.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        setFormError(`"${trimmed}" ${t('common.alreadyExists')}`)
        return
      }
      const baseId = toSlugId(trimmed)
      let id = baseId
      let suffix = 2
      while (parameters.some((p) => p.id === id)) {
        id = `${baseId}-${suffix++}`
      }
      const threshold = Number.isFinite(newThreshold) ? newThreshold : 0
      onParametersChange([
        ...parameters,
        { id, name: trimmed, unit: newUnit.trim(), direction: newDirection, slaThreshold: threshold }
      ])
      setNewName('')
      setNewUnit('ms')
      setNewDirection('less-better')
      setNewThreshold(Number.NaN)
      setFormError('')
    },
    [newName, newUnit, newDirection, newThreshold, parameters, onParametersChange, t]
  )

  return (
    <div className={styles.container}>
      {/* Desktop table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label={t('tab2.slaParametersTitle')}>
          <thead>
            <tr>
              <th>{t('tab2.slaNameColumn')}</th>
              <th>{t('tab2.slaUnitColumn')}</th>
              <th>{t('tab2.slaDirectionColumn')}</th>
              <th>{t('tab2.slaThresholdColumn')}</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {parameters.map((p) => (
              <tr key={p.id} className={styles.row}>
                <td>
                  <input
                    className={styles.input}
                    type="text"
                    value={p.name}
                    onChange={(e) => handleField(p.id, { name: e.target.value })}
                    aria-label={`${t('tab2.slaNameColumn')} — ${p.name}`}
                  />
                </td>
                <td>
                  <input
                    className={styles.input}
                    type="text"
                    value={p.unit}
                    onChange={(e) => handleField(p.id, { unit: e.target.value })}
                    aria-label={`${t('tab2.slaUnitColumn')} — ${p.name}`}
                  />
                </td>
                <td>
                  <select
                    className={styles.input}
                    value={p.direction}
                    onChange={(e) => handleField(p.id, { direction: e.target.value as SlaDirection })}
                    aria-label={`${t('tab2.slaDirectionColumn')} — ${p.name}`}
                  >
                    <option value="less-better">{t('tab2.slaDirectionLessBetter')}</option>
                    <option value="more-better">{t('tab2.slaDirectionMoreBetter')}</option>
                  </select>
                </td>
                <td>
                  <DecimalInput
                    value={p.slaThreshold}
                    onChange={(v) => handleField(p.id, { slaThreshold: v })}
                    className={styles.input}
                    min={0}
                    aria-label={`${t('tab2.slaThresholdColumn')} — ${p.name}`}
                  />
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(p.id)}
                    aria-label={`Remove ${p.name}`}
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className={styles.mobileCards}>
        {parameters.map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{p.name}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemove(p.id)}
                aria-label={`Remove ${p.name}`}
              >
                &times;
              </button>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>{t('tab2.slaNameColumn')}</span>
              <input
                className={styles.input}
                type="text"
                value={p.name}
                onChange={(e) => handleField(p.id, { name: e.target.value })}
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>{t('tab2.slaUnitColumn')}</span>
              <input
                className={styles.input}
                type="text"
                value={p.unit}
                onChange={(e) => handleField(p.id, { unit: e.target.value })}
              />
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>{t('tab2.slaDirectionColumn')}</span>
              <select
                className={styles.input}
                value={p.direction}
                onChange={(e) => handleField(p.id, { direction: e.target.value as SlaDirection })}
              >
                <option value="less-better">{t('tab2.slaDirectionLessBetter')}</option>
                <option value="more-better">{t('tab2.slaDirectionMoreBetter')}</option>
              </select>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>{t('tab2.slaThresholdColumn')}</span>
              <DecimalInput
                value={p.slaThreshold}
                onChange={(v) => handleField(p.id, { slaThreshold: v })}
                className={styles.input}
                min={0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <section className={styles.addSection} aria-label={t('tab2.addSlaParameter')}>
        <span className={styles.addTitle}>{t('tab2.addSlaParameter')}</span>
        <form className={styles.addForm} onSubmit={handleAdd}>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="sla-add-name">
              {t('tab2.slaNameColumn')}
            </label>
            <input
              id="sla-add-name"
              className={`${styles.input} ${formError ? styles.inputError : ''}`}
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                if (formError) setFormError('')
              }}
              placeholder={t('tab2.slaNamePlaceholder')}
              aria-invalid={!!formError}
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="sla-add-unit">
              {t('tab2.slaUnitColumn')}
            </label>
            <input
              id="sla-add-unit"
              className={styles.input}
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="ms"
            />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="sla-add-direction">
              {t('tab2.slaDirectionColumn')}
            </label>
            <select
              id="sla-add-direction"
              className={styles.input}
              value={newDirection}
              onChange={(e) => setNewDirection(e.target.value as SlaDirection)}
            >
              <option value="less-better">{t('tab2.slaDirectionLessBetter')}</option>
              <option value="more-better">{t('tab2.slaDirectionMoreBetter')}</option>
            </select>
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="sla-add-threshold">
              {t('tab2.slaThresholdColumn')}
            </label>
            <DecimalInput
              id="sla-add-threshold"
              value={newThreshold}
              onChange={setNewThreshold}
              className={styles.input}
              min={0}
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
      </section>
    </div>
  )
}
