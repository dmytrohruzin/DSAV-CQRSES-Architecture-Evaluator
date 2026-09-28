'use client'

import Link from 'next/link'

import { useLanguage } from '../i18n/language-context'
import styles from './layout.module.css'

/**
 * Renders the app title as a link to the home page.
 *
 * Extracted into a client component so that the layout (a Server Component)
 * can include a translated `<h1>` without becoming a client component itself.
 */
export function LayoutTitle() {
  const { t } = useLanguage()

  return (
    <h1 className={styles.title}>
      <Link href="/" className={styles.titleLink}>
        {t('common.appTitle')}
      </Link>
    </h1>
  )
}
