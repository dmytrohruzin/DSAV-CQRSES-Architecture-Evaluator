'use client'

import Link from 'next/link'
import { useLanguage } from '../../i18n/language-context'
import type { TranslationKey } from '../../i18n/translations'
import styles from './nav-tabs.module.css'

const tabs: readonly { href: string; labelKey: TranslationKey }[] = [
  { href: '/parameters-assessment', labelKey: 'common.tabParametersAssessment' },
  { href: '/variation-selection', labelKey: 'common.tabVariationSelection' },
  { href: '/migration-roadmap', labelKey: 'common.tabMigrationRoadmap' }
]

export function NavTabs() {
  const { t } = useLanguage()

  return (
    <nav aria-label={t('common.mainNavigation')} className={styles.nav}>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={styles.link}>
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  )
}
