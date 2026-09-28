import type { Metadata } from 'next'
import { Footer } from '../components/footer/footer'
import { LanguageSwitcher } from '../components/language-switcher/language-switcher'
import { NavTabs } from '../components/nav-tabs/nav-tabs'
import './globals.css'
import { HtmlLangSetter } from './html-lang-setter'
import styles from './layout.module.css'
import { LayoutTitle } from './layout-title'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'DSAV-CQRSES Architecture Evaluator',
  description:
    'DSAV CQRS/ES Architecture Evaluator — a tool for selecting the optimal variation of a CQRS-with-Event-Sourcing architecture'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <HtmlLangSetter />
          <div className={styles.wrapper}>
            <header className={styles.header}>
              <div className={styles.headerInner}>
                <div className={styles.titleRow}>
                  <LayoutTitle />
                  <LanguageSwitcher />
                </div>
                <NavTabs />
              </div>
            </header>
            <main className={styles.main}>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
