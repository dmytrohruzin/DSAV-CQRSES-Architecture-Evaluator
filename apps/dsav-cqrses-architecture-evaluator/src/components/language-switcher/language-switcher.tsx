'use client'

import { useLanguage } from '../../i18n/language-context'
import type { Locale } from '../../i18n/translations'
import styles from './language-switcher.module.css'

const locales: readonly { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ua', label: 'UA' }
] as const

export function LanguageSwitcher() {
  const { locale, hydrated, setLocale } = useLanguage()

  return (
    <div className={styles.switcher}>
      {locales.map((item, index) => (
        <span key={item.value} style={{ display: 'contents' }}>
          {index > 0 && <span className={styles.divider} aria-hidden="true" />}
          <button
            type="button"
            aria-pressed={hydrated ? locale === item.value : undefined}
            className={`${styles.button}${hydrated && locale === item.value ? ` ${styles.buttonActive}` : ''}`}
            onClick={() => setLocale(item.value)}
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  )
}
