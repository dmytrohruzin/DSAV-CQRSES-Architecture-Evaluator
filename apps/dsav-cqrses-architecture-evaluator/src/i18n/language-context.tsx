'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { getTranslation, type Locale, type TranslationKey, translations } from './translations'

interface LanguageContextValue {
  locale: Locale
  hydrated: boolean
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const STORAGE_KEY = 'dsav-locale'
const DEFAULT_LOCALE: Locale = 'en'

function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // localStorage unavailable — silently ignore
  }
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [hydrated, setHydrated] = useState(false)

  // Sync from localStorage after hydration to avoid SSR/client mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'ua') {
        setLocaleState(stored)
      }
    } catch {
      // localStorage unavailable
    }
    setHydrated(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const t = useCallback((key: TranslationKey): string => getTranslation(translations[locale], key), [locale])

  return <LanguageContext.Provider value={{ locale, hydrated, setLocale, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
