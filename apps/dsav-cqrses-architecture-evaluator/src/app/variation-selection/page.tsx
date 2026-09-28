'use client'

import { DecimalInput } from '../../components/decimal-input/decimal-input'
import { HardwareConfigurations } from '../../components/hardware-configurations/hardware-configurations'
import { MetricsTable } from '../../components/metrics-table/metrics-table'
import { OptimalVariationResult } from '../../components/optimal-variation-result/optimal-variation-result'
import { QualityAttributes } from '../../components/quality-attributes/quality-attributes'
import { RelativeComplexityResults } from '../../components/relative-complexity-results/relative-complexity-results'
import { RelativeHostingPriceResults } from '../../components/relative-hosting-price-results/relative-hosting-price-results'
import { SlaParameters } from '../../components/sla-parameters/sla-parameters'
import { useVariationSelection } from '../../hooks/use-variation-selection'
import { useLanguage } from '../../i18n/language-context'
import styles from './page.module.css'

export default function VariationSelection() {
  const { t } = useLanguage()

  const {
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
  } = useVariationSelection()

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{t('tab2.heading')}</h2>
      <p className={styles.description}>{t('tab2.description')}</p>

      {/* Section 1: Quality Attributes */}
      <section className={styles.section} aria-label={t('tab2.qualityAttributesTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.qualityAttributesTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.qualityAttributesDescription')}</p>
        <QualityAttributes attributes={attributes} onAttributesChange={handleAttributesChange} />
      </section>

      {/* Section 2: Quality Attribute Components Weights */}
      <section className={styles.section} aria-label={t('tab2.weightsTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.weightsTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.weightsDescription')}</p>

        {activeAttributes.length === 0 ? (
          <div className={styles.weightsEmpty}>{t('tab2.qualityAttributesDescription')}</div>
        ) : (
          <>
            <div className={styles.weightsTableWrapper}>
              <table className={styles.weightsTable} aria-label={t('tab2.weightsTitle')}>
                <thead>
                  <tr>
                    <th>{t('tab2.weightCriterionColumn')}</th>
                    <th>{t('tab2.calculationTemplate')}</th>
                    <th>{t('tab2.weightValue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAttributes.map((attr) => {
                    const weight = componentWeights[attr.metricKey] ?? { template: 'value', value: 1 }
                    return (
                      <tr key={attr.metricKey} className={styles.weightsTableRow}>
                        <td className={styles.weightsTableLabel}>{attr.weightCriterion}</td>
                        <td className={styles.weightsTableCell}>
                          <select
                            className={styles.weightsSelect}
                            value={weight.template}
                            onChange={(e) => handleComponentWeightTemplateChange(attr.metricKey, e.target.value)}
                            aria-label={`${t('tab2.calculationTemplate')} — ${attr.weightCriterion}`}
                          >
                            <option value="value">value</option>
                          </select>
                        </td>
                        <td className={styles.weightsTableCell}>
                          <DecimalInput
                            value={weight.value}
                            onChange={(v) => handleComponentWeightValueChange(attr.metricKey, v)}
                            className={`${styles.weightsInput} ${weight.value <= 0 ? styles.weightsInputError : ''}`}
                            min={0}
                            aria-label={`${t('tab2.weightValue')} — ${attr.weightCriterion}`}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.weightsMobileCards}>
              {activeAttributes.map((attr) => {
                const weight = componentWeights[attr.metricKey] ?? { template: 'value', value: 1 }
                return (
                  <div key={attr.metricKey} className={styles.weightsMobileCard}>
                    <span className={styles.weightsMobileCardTitle}>{attr.weightCriterion}</span>
                    <div className={styles.weightsMobileCardRow}>
                      <span className={styles.weightsMobileCardLabel}>{t('tab2.calculationTemplate')}</span>
                      <select
                        className={styles.weightsSelect}
                        value={weight.template}
                        onChange={(e) => handleComponentWeightTemplateChange(attr.metricKey, e.target.value)}
                        aria-label={`${t('tab2.calculationTemplate')} — ${attr.weightCriterion}`}
                      >
                        <option value="value">value</option>
                      </select>
                    </div>
                    <div className={styles.weightsMobileCardRow}>
                      <span className={styles.weightsMobileCardLabel}>{t('tab2.weightValue')}</span>
                      <DecimalInput
                        value={weight.value}
                        onChange={(v) => handleComponentWeightValueChange(attr.metricKey, v)}
                        className={`${styles.weightsInput} ${weight.value <= 0 ? styles.weightsInputError : ''}`}
                        min={0}
                        aria-label={`${t('tab2.weightValue')} — ${attr.weightCriterion}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {invalidWeightAttributes.length === 0 ? (
              <div className={`${styles.weightsValidation} ${styles.weightsValidationOk}`}>
                &#10003; {t('tab2.weightsAllValid')}
              </div>
            ) : (
              <div className={`${styles.weightsValidation} ${styles.weightsValidationErrors}`}>
                {invalidWeightAttributes.map((attr) => (
                  <span key={attr.metricKey} className={styles.weightsValidationErrorItem}>
                    &#9888; {attr.weightCriterion}: {t('tab2.weightsInvalidValue')}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Section 3: Variation Metrics */}
      <section className={styles.section} aria-label={t('tab2.variationMetricsTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.variationMetricsTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.variationMetricsDescription')}</p>
        <MetricsTable
          metricKeys={metricKeys}
          metricKeyLabels={metricKeyLabels}
          variations={variations}
          onVariationsChange={handleVariationsChange}
        />
      </section>

      {/* Section 4: SLA Parameters */}
      <section className={styles.section} aria-label={t('tab2.slaParametersTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.slaParametersTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.slaParametersDescription')}</p>
        <SlaParameters parameters={slaParameters} onParametersChange={handleSlaParametersChange} />
      </section>

      {/* Section 5: Hardware Configurations per Variation */}
      <section className={styles.section} aria-label={t('tab2.hardwareConfigurationsTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.hardwareConfigurationsTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.hardwareConfigurationsDescription')}</p>
        <HardwareConfigurations
          variationNames={variations.map((v) => v.name)}
          slaParameters={slaParameters}
          data={hardwareData}
          onDataChange={handleHardwareDataChange}
        />
      </section>

      {/* Section 6: swp */}
      <section className={styles.section} aria-label={t('tab2.swpTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.swpTitle')}</h3>
        <p className={styles.sectionDescription}>{t('tab2.swpDescription')}</p>
        <div className={styles.swpRow}>
          <DecimalInput
            id="swp-input"
            value={swp}
            onChange={handleSwpChange}
            className={styles.swpInput}
            min={0}
            aria-label={t('tab2.swpTitle')}
          />
          <span className={styles.swpUnit}>{t('tab2.swpUnit')}</span>
        </div>
      </section>

      {/* Calculate button */}
      <div className={styles.calculateRow}>
        <button
          type="button"
          className={styles.calculateButton}
          disabled={!isValid}
          onClick={handleCalculate}
          aria-label={t('tab2.calculateOptimalVariation')}
        >
          {t('tab2.calculateOptimalVariation')}
        </button>
      </div>

      {/* Section 7: Results */}
      <section className={styles.section} aria-label={t('tab2.resultsTitle')}>
        <h3 className={styles.sectionTitle}>{t('tab2.resultsTitle')}</h3>

        <h4 className={styles.sectionSubtitle}>{t('tab2.relativeComplexityTitle')}</h4>
        <RelativeComplexityResults results={results?.relativeComplexity ?? []} />

        <h4 className={styles.sectionSubtitle}>{t('tab2.relativeHostingTitle')}</h4>
        <RelativeHostingPriceResults results={results?.relativeHostingPrice ?? []} />

        <h4 className={styles.sectionSubtitle}>{t('tab2.optimalResultTitle')}</h4>
        <OptimalVariationResult results={results?.optimal ?? []} />
      </section>
    </div>
  )
}
