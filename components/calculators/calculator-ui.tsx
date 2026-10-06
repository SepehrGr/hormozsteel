import type { ReactNode } from 'react'

import { formatNumber } from '@/lib/format'

export const fieldClass =
  'mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground tabular-nums placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'

export const selectClass = `${fieldClass} cursor-pointer`

export const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-muted-foreground'

export function Field({
  id,
  label,
  children,
  className = '',
}: {
  id?: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function CalculatorActions({
  onCalculate,
  onReset,
  calculateLabel = 'Calculate',
}: {
  onCalculate: () => void
  onReset: () => void
  calculateLabel?: string
}) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <button
        className='inline-flex flex-1 cursor-pointer items-center justify-center bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
        type='button'
        onClick={onCalculate}
      >
        {calculateLabel}
      </button>
      <button
        className='inline-flex cursor-pointer items-center justify-center border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
        type='button'
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  )
}

export function CalculatorResult({
  weightKg,
  details,
  totalPrice,
  priceLabel,
}: {
  weightKg: number
  details?: ReactNode
  totalPrice?: number | null
  priceLabel?: string
}) {
  return (
    <div className='border border-border bg-muted/40 px-4 py-4'>
      <p className='text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
        Result
      </p>
      <div className='mt-2 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground'>
            {formatNumber(weightKg, 2)}{' '}
            <span className='text-base font-medium text-muted-foreground'>
              kg
            </span>
          </p>
          {details ? (
            <div className='mt-2 space-y-0.5 text-xs text-muted-foreground'>
              {details}
            </div>
          ) : null}
        </div>
        {totalPrice != null && priceLabel ? (
          <div className='text-right'>
            <p className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Est. value
            </p>
            <p className='font-mono text-lg font-semibold tabular-nums text-foreground'>
              {priceLabel}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function FormulaNote({
  formula,
  notes,
}: {
  formula: string
  notes?: string[]
}) {
  return (
    <div className='border border-border bg-card px-4 py-3'>
      <p className='text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
        Formula
      </p>
      <code className='mt-2 block font-mono text-xs leading-relaxed text-foreground sm:text-sm'>
        {formula}
      </code>
      {notes?.length ? (
        <ul className='mt-2 space-y-1 text-xs text-muted-foreground'>
          {notes.map(n => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export const STEEL_DENSITIES = [
  { value: '7.85', label: 'Carbon steel (7.85)' },
  { value: '8', label: 'Common practice (8.0)' },
  { value: '7.86', label: 'Iron (7.86)' },
  { value: '7.84', label: 'Stainless (approx. 7.84)' },
  { value: '2.7', label: 'Aluminum (2.7)' },
  { value: '2.73', label: 'Aluminum sheet (2.73)' },
  { value: '8.96', label: 'Copper (8.96)' },
  { value: '8.5', label: 'Brass (8.5)' },
] as const

export function DensitySelect({
  id = 'density',
  value,
  onChange,
  options = STEEL_DENSITIES.slice(0, 4),
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options?: readonly { value: string; label: string }[]
}) {
  return (
    <Field id={id} label='Density (g/cm³)'>
      <select
        className={selectClass}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function computeLinePrice(
  weightKg: number,
  productPrice?: number,
  productUnit: 'kg' | 'ton' | 'piece' = 'kg',
  includeVAT = false,
) {
  if (!productPrice || weightKg <= 0) return null
  let final =
    productUnit === 'ton'
      ? (weightKg / 1000) * productPrice
      : weightKg * productPrice

  if (includeVAT) final *= 1.1

  return Math.round(final * 100) / 100
}
