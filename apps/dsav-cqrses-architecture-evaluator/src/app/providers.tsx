'use client'

import type { ReactNode } from 'react'
import { LanguageProvider, useLanguage } from '../i18n/language-context'

function HydrationGate({ children }: { children: ReactNode }) {
  const { hydrated } = useLanguage()
  return <div style={{ visibility: hydrated ? 'visible' : 'hidden' }}>{children}</div>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <HydrationGate>{children}</HydrationGate>
    </LanguageProvider>
  )
}
