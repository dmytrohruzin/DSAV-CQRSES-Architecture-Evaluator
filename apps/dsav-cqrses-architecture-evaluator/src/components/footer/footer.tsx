'use client'

import { useLanguage } from '../../i18n/language-context'
import styles from './footer.module.css'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>
          {t('common.footerBuiltOn')}{' '}
          <a href="https://dbbsoftware.com/" target="_blank" rel="noopener noreferrer" className={styles.link}>
            {t('common.footerPlatform')}
          </a>
        </p>
        <p className={styles.line}>
          {t('common.footerWithin')}{' '}
          <a href="https://www.dnu.dp.ua/" target="_blank" rel="noopener noreferrer" className={styles.link}>
            {t('common.footerUniversity')}
          </a>
        </p>
      </div>
    </footer>
  )
}
