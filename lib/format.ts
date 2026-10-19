import { siteConfig } from '@/config/site'

const { locale, currency } = siteConfig

/** Placeholder shown wherever a date is missing or unparsable. */
export const EMPTY_VALUE = '—'

// Intl formatters are costly to construct, so build each one once.
const usd = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const usdWhole = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
})
const dateFmt = new Intl.DateTimeFormat(locale, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const dateTimeFmt = new Intl.DateTimeFormat(locale, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const shortDateTimeFmt = new Intl.DateTimeFormat(locale, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const relativeFmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
const narrowRelativeFmt = new Intl.RelativeTimeFormat(locale, {
  numeric: 'auto',
  style: 'narrow',
})

type DateInput = Date | string | null | undefined

function toDate(value: DateInput) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/** `$1,234.50`; pass `whole` for dashboard-style `$1,235`. */
export function formatUsd(amount: number, { whole = false } = {}) {
  return (whole ? usdWhole : usd).format(amount)
}

/** Plain grouped number: `1,234` or, with `fractionDigits`, `1,234.50`. */
export function formatNumber(value: number, fractionDigits?: number) {
  return value.toLocaleString(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits ?? 3,
  })
}

/** `Oct 6, 2026` */
export function formatDate(value: DateInput) {
  const date = toDate(value)

  return date ? dateFmt.format(date) : EMPTY_VALUE
}

/** `Oct 6, 2026, 02:30 PM` */
export function formatDateTime(value: DateInput) {
  const date = toDate(value)

  return date ? dateTimeFmt.format(date) : EMPTY_VALUE
}

/** `Oct 6, 02:30 PM`, or null so callers can fall back to another source. */
export function formatShortDateTime(value: DateInput) {
  const date = toDate(value)

  return date ? shortDateTimeFmt.format(date) : null
}

// Each unit, and how many of it make the next one
const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 7],
  ['week', 4.35],
  ['month', 12],
  ['year', Infinity],
]

/**
 * `5 minutes ago`, `yesterday`, `3 months ago`; `narrow` gives `5m ago`.
 * Render on the server only: the client's clock would differ.
 */
export function formatRelative(value: DateInput, { narrow = false } = {}) {
  const date = toDate(value)

  if (!date) return EMPTY_VALUE

  let amount = (date.getTime() - Date.now()) / 1000

  for (const [unit, size] of RELATIVE_STEPS) {
    if (Math.abs(amount) < size) {
      return (narrow ? narrowRelativeFmt : relativeFmt).format(
        Math.round(amount),
        unit,
      )
    }
    amount /= size
  }

  return EMPTY_VALUE
}

/** `category` → `Category` */
export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** `1 product`, `3 products` */
export function pluralize(count: number, word: string, plural = `${word}s`) {
  return `${count} ${count === 1 ? word : plural}`
}
