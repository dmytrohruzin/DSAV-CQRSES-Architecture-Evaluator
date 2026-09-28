'use client'

import { useEffect } from 'react'
import { useLanguage } from '../i18n/language-context'

/**
 * Sets the `<html lang>` attribute to match the current locale.
 *
 * This is a client component because Server Components cannot access
 * React context. It renders nothing visible — it only produces a
 * side-effect on mount and when the locale changes.
 */
export function HtmlLangSetter() {
  const { locale } = useLanguage()

  useEffect(() => {
    const langMap: Record<string, string> = { en: 'en', ua: 'uk' }
    document.documentElement.lang = langMap[locale] ?? 'en'
  }, [locale])

  return null
}
