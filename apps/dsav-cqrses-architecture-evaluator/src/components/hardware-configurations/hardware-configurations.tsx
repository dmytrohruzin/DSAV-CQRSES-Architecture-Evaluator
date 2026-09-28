'use client'

import { type FormEvent, useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import { isPositiveFinite } from '../../lib/validation/validators'
import type { HardwareConfig, SlaParameter, VariationHardwareData } from '../../lib/variation-selection/types'
import { DecimalInput } from '../decimal-input/decimal-input'
import styles from './hardware-configurations.module.css'

interface HardwareConfigurationsProps {
  variationNames: string[]
  slaParameters: SlaParameter[]
  data: VariationHardwareData[]
  onDataChange: (next: VariationHardwareData[]) => void
}

function makeId(variationName: string, configName: string): string {
  const slug = `${variationName}-${configName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `hw-${Math.random().toString(36).slice(2, 8)}`
}

function emptySlaValues(slaParameters: SlaParameter[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const sla of slaParameters) out[sla.id] = Number.NaN
  return out
}

export function HardwareConfigurations({
  variationNames,
  slaParameters,
  data,
  onDataChange
}: HardwareConfigurationsProps) {
  const { t } = useLanguage()

  const [newNames, setNewNames] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const setNewNameFor = (variationName: string, value: string) => {
    setNewNames((prev) => ({ ...prev, [variationName]: value }))
    if (formErrors[variationName]) {
      setFormErrors((prev) => ({ ...prev, [variationName]: '' }))
    }
  }

  const updateBlock = useCallback(
    (variationName: string, updater: (configs: HardwareConfig[]) => HardwareConfig[]) => {
      onDataChange(
        data.map((block) =>
          block.variationName === variationName ? { ...block, configs: updater(block.configs) } : block
        )
      )
    },
    [data, onDataChange]
  )

  const handleConfigField = useCallback(
    (variationName: string, configId: string, patch: Partial<HardwareConfig>) => {
      updateBlock(variationName, (configs) => configs.map((c) => (c.id === configId ? { ...c, ...patch } : c)))
    },
    [updateBlock]
  )

  const handleConfigSlaValue = useCallback(
    (variationName: string, configId: string, slaId: string, value: number) => {
      updateBlock(variationName, (configs) =>
        configs.map((c) => (c.id === configId ? { ...c, slaValues: { ...c.slaValues, [slaId]: value } } : c))
      )
    },
    [updateBlock]
  )

  const handleRemoveConfig = useCallback(
    (variationName: string, configId: string) => {
      updateBlock(variationName, (configs) => configs.filter((c) => c.id !== configId))
    },
    [updateBlock]
  )

  const handleAddConfig = useCallback(
    (variationName: string) => (e: FormEvent) => {
      e.preventDefault()
      const trimmed = (newNames[variationName] ?? '').trim()
      if (!trimmed) {
        setFormErrors((prev) => ({ ...prev, [variationName]: t('tab2.hardwareNameRequired') }))
        return
      }
      const block = data.find((b) => b.variationName === variationName)
      if (block?.configs.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        setFormErrors((prev) => ({ ...prev, [variationName]: `"${trimmed}" ${t('common.alreadyExists')}` }))
        return
      }
      const id = makeId(variationName, trimmed)
      updateBlock(variationName, (configs) => [
        ...configs,
        {
          id,
          name: trimmed,
          pricePerMonthUsd: Number.NaN,
          slaValues: emptySlaValues(slaParameters)
        }
      ])
      setNewNames((prev) => ({ ...prev, [variationName]: '' }))
      setFormErrors((prev) => ({ ...prev, [variationName]: '' }))
    },
    [newNames, data, slaParameters, updateBlock, t]
  )

  return (
    <div className={styles.container}>
      {variationNames.length === 0 && <div className={styles.empty}>{t('tab2.hardwareNoVariations')}</div>}

      {variationNames.map((variationName) => {
        const block = data.find((b) => b.variationName === variationName)
        const configs = block?.configs ?? []
        const error = formErrors[variationName] ?? ''
        const newName = newNames[variationName] ?? ''

        return (
          <section key={variationName} className={styles.block} aria-label={variationName}>
            <h4 className={styles.blockTitle}>{variationName}</h4>

            {/* Desktop table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table} aria-label={`${variationName} hardware configs`}>
                <thead>
                  <tr>
                    <th className={styles.colName}>{t('tab2.hardwareNameColumn')}</th>
                    <th className={styles.colPrice}>{t('tab2.hardwarePriceColumn')}</th>
                    {slaParameters.map((sla) => (
                      <th key={sla.id} className={styles.colSla}>
                        {sla.name}
                        {sla.unit ? ` (${sla.unit})` : ''}
                      </th>
                    ))}
                    <th aria-label="actions" />
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.id} className={styles.row}>
                      <td>
                        <input
                          className={styles.input}
                          type="text"
                          value={config.name}
                          onChange={(e) => handleConfigField(variationName, config.id, { name: e.target.value })}
                          aria-label={`${t('tab2.hardwareNameColumn')} — ${config.name}`}
                        />
                      </td>
                      <td>
                        <DecimalInput
                          value={config.pricePerMonthUsd}
                          onChange={(v) => handleConfigField(variationName, config.id, { pricePerMonthUsd: v })}
                          className={`${styles.input} ${isPositiveFinite(config.pricePerMonthUsd) ? '' : styles.inputError}`}
                          min={0}
                          aria-label={`${t('tab2.hardwarePriceColumn')} — ${config.name}`}
                          aria-invalid={!isPositiveFinite(config.pricePerMonthUsd)}
                        />
                      </td>
                      {slaParameters.map((sla) => (
                        <td key={sla.id}>
                          <DecimalInput
                            value={config.slaValues[sla.id] ?? Number.NaN}
                            onChange={(v) => handleConfigSlaValue(variationName, config.id, sla.id, v)}
                            className={styles.input}
                            min={0}
                            aria-label={`${sla.name} — ${config.name}`}
                          />
                        </td>
                      ))}
                      <td className={styles.actions}>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemoveConfig(variationName, config.id)}
                          aria-label={`Remove ${config.name}`}
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
              {configs.map((config) => (
                <div key={config.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{config.name || '—'}</span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveConfig(variationName, config.id)}
                      aria-label={`Remove ${config.name}`}
                    >
                      &times;
                    </button>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>{t('tab2.hardwareNameColumn')}</span>
                    <input
                      className={styles.input}
                      type="text"
                      value={config.name}
                      onChange={(e) => handleConfigField(variationName, config.id, { name: e.target.value })}
                    />
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>{t('tab2.hardwarePriceColumn')}</span>
                    <DecimalInput
                      value={config.pricePerMonthUsd}
                      onChange={(v) => handleConfigField(variationName, config.id, { pricePerMonthUsd: v })}
                      className={`${styles.input} ${isPositiveFinite(config.pricePerMonthUsd) ? '' : styles.inputError}`}
                      min={0}
                      aria-label={`${t('tab2.hardwarePriceColumn')} — ${config.name}`}
                      aria-invalid={!isPositiveFinite(config.pricePerMonthUsd)}
                    />
                  </div>
                  {slaParameters.map((sla) => (
                    <div key={sla.id} className={styles.cardRow}>
                      <span className={styles.cardLabel}>
                        {sla.name}
                        {sla.unit ? ` (${sla.unit})` : ''}
                      </span>
                      <DecimalInput
                        value={config.slaValues[sla.id] ?? Number.NaN}
                        onChange={(v) => handleConfigSlaValue(variationName, config.id, sla.id, v)}
                        className={styles.input}
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Add form */}
            <form className={styles.addForm} onSubmit={handleAddConfig(variationName)}>
              <input
                type="text"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={newName}
                placeholder={t('tab2.hardwareNamePlaceholder')}
                onChange={(e) => setNewNameFor(variationName, e.target.value)}
                aria-label={`${t('tab2.addHardwareConfig')} — ${variationName}`}
              />
              <button type="submit" className={styles.addButton}>
                {t('tab2.addHardwareConfig')}
              </button>
            </form>
            {error && (
              <span className={styles.formError} role="alert">
                {error}
              </span>
            )}
          </section>
        )
      })}
    </div>
  )
}
