'use client'

import { useLanguage } from '../../i18n/language-context'
import { validationMessage } from '../../i18n/validation-messages'
import type { ValidationError } from '../../lib/validation/types'
import styles from './validation-status.module.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationStatusProps {
  errors: ValidationError[]
  isValid: boolean
}

// ---------------------------------------------------------------------------
// Constants — success summary messages
// ---------------------------------------------------------------------------

// Success message keys mapped to translation keys
const SUCCESS_MESSAGE_KEYS = [
  'tab2.validationAllMetricKeysPresent',
  'tab2.validationAllValuesPositive',
  'tab2.validationPerformancePrioritiesSum'
] as const

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      className={styles.icon}
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 4.5L6.5 11.5L2.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      className={styles.icon}
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 5V8.5M8 11H8.005M2.5 13.5H13.5L8 2.5L2.5 13.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ValidationStatus({ errors, isValid }: ValidationStatusProps) {
  const { t } = useLanguage()

  return (
    <output
      className={`${styles.panel} ${isValid ? styles.panelValid : styles.panelInvalid}`}
      aria-live="polite"
      aria-label={isValid ? t('tab2.validationPassed') : `${t('tab2.validationErrors')} (${errors.length})`}
    >
      <h4 className={styles.heading}>{isValid ? t('tab2.validationPassed') : t('tab2.validationErrors')}</h4>

      {isValid ? (
        <ul className={styles.list}>
          {SUCCESS_MESSAGE_KEYS.map((key) => (
            <li key={key} className={styles.itemValid}>
              <CheckIcon />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {errors.map((error) => (
            <li key={`${error.code}-${error.message}`} className={styles.itemInvalid}>
              <WarningIcon />
              <span>{validationMessage(error, t)}</span>
            </li>
          ))}
        </ul>
      )}
    </output>
  )
}
