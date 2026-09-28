'use client'

import Link from 'next/link'
import { useLanguage } from '../i18n/language-context'
import type { TranslationKey } from '../i18n/translations'
import styles from './page.module.css'

const features: readonly {
  href: string
  titleKey: TranslationKey
  descriptionKey: TranslationKey
}[] = [
  {
    href: '/parameters-assessment',
    titleKey: 'home.cardParametersAssessmentTitle',
    descriptionKey: 'home.cardParametersAssessmentDescription'
  },
  {
    href: '/variation-selection',
    titleKey: 'home.cardVariationSelectionTitle',
    descriptionKey: 'home.cardVariationSelectionDescription'
  },
  {
    href: '/migration-roadmap',
    titleKey: 'home.cardMigrationRoadmapTitle',
    descriptionKey: 'home.cardMigrationRoadmapDescription'
  }
]

export default function Home() {
  const { t } = useLanguage()

  return (
    <div>
      <section className={styles.hero}>
        <h2 className={styles.heading}>{t('home.heading')}</h2>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
      </section>

      <div className={styles.cards}>
        {features.map((feature, index) => (
          <Link key={feature.href} href={feature.href} className={styles.card}>
            <span className={styles.cardNumber}>{index + 1}</span>
            <span className={styles.cardTitle}>{t(feature.titleKey)}</span>
            <span className={styles.cardDescription}>{t(feature.descriptionKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
