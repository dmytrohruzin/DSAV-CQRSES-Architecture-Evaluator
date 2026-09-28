'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/language-context'
import styles from './decimal-input.module.css'

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DecimalInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  min?: number
  step?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  id?: string
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Format a number for display using the locale-specific decimal separator */
function formatForDisplay(value: number, locale: string): string {
  if (Number.isNaN(value)) return ''
  const str = String(value)
  if (locale === 'ua') {
    return str.replace('.', ',')
  }
  return str
}

/** Parse user input to a number, accepting both . and , as decimal separators */
function parseInput(raw: string): number {
  const normalized = raw.replace(',', '.')
  if (normalized.trim() === '' || normalized === '-' || normalized === '.') {
    return Number.NaN
  }
  return Number.parseFloat(normalized)
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DecimalInput({ value, onChange, className, min, step, id, ...ariaProps }: DecimalInputProps) {
  const { locale } = useLanguage()
  const [displayValue, setDisplayValue] = useState(() => formatForDisplay(value, locale))
  const [isFocused, setIsFocused] = useState(false)

  // Sync display value from prop when not focused
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value, locale))
    }
  }, [value, locale, isFocused])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    // Show raw numeric value for easier editing
    if (!Number.isNaN(value)) {
      setDisplayValue(String(value))
    }
  }, [value])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Re-format with locale separator
    const parsed = parseInput(displayValue)
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
      setDisplayValue(formatForDisplay(parsed, locale))
    } else {
      // Reset to current value if input is invalid
      setDisplayValue(formatForDisplay(value, locale))
    }
  }, [displayValue, locale, onChange, value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setDisplayValue(raw)

      const parsed = parseInput(raw)
      if (!Number.isNaN(parsed)) {
        onChange(parsed)
      }
    },
    [onChange]
  )

  return (
    <input
      type="text"
      inputMode="decimal"
      id={id}
      className={`${styles.input} ${className ?? ''}`}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      min={min}
      step={step}
      {...ariaProps}
    />
  )
}
