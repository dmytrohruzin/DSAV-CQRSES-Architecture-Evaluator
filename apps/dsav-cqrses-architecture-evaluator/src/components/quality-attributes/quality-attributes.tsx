'use client'

import { type FormEvent, useCallback, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import { addCustomAttribute, removeAttribute, toggleAttribute } from '../../lib/variation-selection/quality-attributes'
import type { QualityAttribute, QualityAttributeComponentType } from '../../lib/variation-selection/types'
import styles from './quality-attributes.module.css'

interface QualityAttributesProps {
  attributes: QualityAttribute[]
  onAttributesChange: (attributes: QualityAttribute[]) => void
}

export function QualityAttributes({ attributes, onAttributesChange }: QualityAttributesProps) {
  const { t } = useLanguage()

  const [customName, setCustomName] = useState('')
  const [customWeight, setCustomWeight] = useState('')
  const [customComponentType, setCustomComponentType] = useState<QualityAttributeComponentType>('OQAC')

  const handleToggle = useCallback(
    (name: string) => {
      onAttributesChange(toggleAttribute(attributes, name))
    },
    [attributes, onAttributesChange]
  )

  const handleRemove = useCallback(
    (name: string) => {
      onAttributesChange(removeAttribute(attributes, name))
    },
    [attributes, onAttributesChange]
  )

  const handleAddCustom = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const trimmedName = customName.trim()
      if (!trimmedName) return

      const updated = addCustomAttribute(attributes, trimmedName, customComponentType, customWeight.trim())
      onAttributesChange(updated)

      setCustomName('')
      setCustomWeight('')
      setCustomComponentType('OQAC')
    },
    [attributes, onAttributesChange, customName, customWeight, customComponentType]
  )

  return (
    <div className={styles.container}>
      <section className={styles.group} aria-label={t('tab2.complexityAttributes')}>
        <h3 className={styles.groupTitle}>{t('tab2.complexityAttributes')}</h3>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <colgroup>
              <col style={{ width: '42px' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '5.5em' }} />
              <col style={{ width: '40px' }} />
            </colgroup>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.colCheckbox} />
                <th className={styles.colName}>{t('common.name')}</th>
                <th className={styles.colWeight}>{t('tab2.weightCriterionColumn')}</th>
                <th className={styles.colType}>{t('tab2.componentTypeLabel')}</th>
                <th className={styles.colDelete} />
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => (
                <tr key={attr.name} className={styles.tableRow}>
                  <td className={styles.cellCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={attr.enabled}
                      onChange={() => handleToggle(attr.name)}
                      aria-label={`Toggle ${attr.name}`}
                    />
                  </td>
                  <td className={styles.attrName}>{attr.name}</td>
                  <td className={styles.weightCriterion}>{attr.weightCriterion}</td>
                  <td className={styles.cellType}>
                    <span
                      className={`${styles.componentTypeBadge} ${attr.componentType === 'OQAC' ? styles.badgeOqac : styles.badgePsqac}`}
                    >
                      {attr.componentType}
                    </span>
                  </td>
                  <td className={styles.cellDelete}>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleRemove(attr.name)}
                      aria-label={`Remove ${attr.name}`}
                      title={`Remove ${attr.name}`}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.addSection} aria-label={t('tab2.addCustomAttribute')}>
        <span className={styles.addSectionTitle}>{t('tab2.addCustomAttribute')}</span>
        <form className={styles.addForm} onSubmit={handleAddCustom}>
          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="qa-custom-component">
              {t('tab2.componentTypeLabel')}
            </label>
            <select
              id="qa-custom-component"
              className={styles.addInput}
              value={customComponentType}
              onChange={(e) => setCustomComponentType(e.target.value as QualityAttributeComponentType)}
            >
              <option value="OQAC">OQAC</option>
              <option value="PSQAC">PSQAC</option>
            </select>
          </div>

          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="qa-custom-name">
              {t('common.name')}
            </label>
            <input
              id="qa-custom-name"
              className={styles.addInput}
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Custom Quality Attribute"
              required
            />
          </div>

          <div className={styles.addField}>
            <label className={styles.addLabel} htmlFor="qa-custom-weight">
              {t('tab2.weightCriterionColumn')}
            </label>
            <input
              id="qa-custom-weight"
              className={styles.addInput}
              type="text"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              placeholder="e.g. Number of widgets"
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
