'use client'

import { useState } from 'react'
import {
  Field,
  fieldClass,
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
  formatUsd,
  computeLinePrice,
  STEEL_DENSITIES,
} from './calculator-ui'

const SHEET_TYPES = [
  { value: 'black', label: 'Hot-rolled / black' },
  { value: 'galvanized', label: 'Galvanized' },
  { value: 'color', label: 'Color-coated' },
  { value: 'cold', label: 'Cold-rolled / oiled' },
  { value: 'pickled', label: 'Pickled' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'chequered', label: 'Chequered / floor plate' },
  { value: 'hardox', label: 'Abrasion plate (Hardox-type)' },
] as const

interface Props {
  productPrice?: number
  productUnit?: 'kg' | 'ton' | 'piece'
  includeVAT?: boolean
  formatPrice?: (price: number) => string
}

export default function SheetWeightCalculator({
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice = formatUsd,
}: Props) {
  const [sheetType, setSheetType] = useState('black')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [thickness, setThickness] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  const calculateWeight = () => {
    const l = parseFloat(length)
    const w = parseFloat(width)
    const t = parseFloat(thickness)
    const d = parseFloat(density)
    if (!l || !w || !t || !d) return

    let weight = l * w * t * d
    if (sheetType === 'chequered') {
      const x = t <= 3 ? 0.3 : 0.4
      weight = (x + t) * l * w * d
    } else if (sheetType === 'hardox') {
      weight = (0.3 + t) * l * w * d
    } else if (sheetType === 'aluminum') {
      weight = l * w * t * 2.73
    }

    const rounded = Math.round(weight * 100) / 100
    setResult(rounded)
    setTotalPrice(
      computeLinePrice(rounded, productPrice, productUnit, includeVAT),
    )
  }

  const resetForm = () => {
    setLength('')
    setWidth('')
    setThickness('')
    setResult(null)
    setTotalPrice(null)
  }

  const typeLabel =
    SHEET_TYPES.find(t => t.value === sheetType)?.label ?? sheetType

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='sheetType' label='Sheet type'>
          <select
            id='sheetType'
            value={sheetType}
            onChange={e => setSheetType(e.target.value)}
            className={fieldClass}
          >
            {SHEET_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <DensitySelect
          value={density}
          onChange={setDensity}
          options={STEEL_DENSITIES.filter(d =>
            ['7.85', '8', '7.86', '7.84', '2.73'].includes(d.value),
          )}
        />
        <Field id='length' label='Length (m)'>
          <input
            id='length'
            type='number'
            inputMode='decimal'
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder='e.g. 6'
            className={fieldClass}
          />
        </Field>
        <Field id='width' label='Width (m)'>
          <input
            id='width'
            type='number'
            inputMode='decimal'
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder='e.g. 1.5'
            className={fieldClass}
          />
        </Field>
        <Field id='thickness' label='Thickness (mm)' className='sm:col-span-2'>
          <input
            id='thickness'
            type='number'
            inputMode='decimal'
            value={thickness}
            onChange={e => setThickness(e.target.value)}
            placeholder='e.g. 3'
            className={fieldClass}
          />
        </Field>
      </div>

      <CalculatorActions
        onCalculate={calculateWeight}
        onReset={resetForm}
        calculateLabel='Calculate weight'
      />

      {result != null && (
        <CalculatorResult
          weightKg={result}
          totalPrice={totalPrice}
          priceLabel={
            totalPrice != null
              ? `${formatPrice(totalPrice)}${includeVAT ? ' incl. tax' : ''}`
              : undefined
          }
          details={
            <p>
              {typeLabel}: {length} m × {width} m × {thickness} mm · ρ{' '}
              {sheetType === 'aluminum' ? '2.73' : density}
            </p>
          }
        />
      )}

      <FormulaNote
        formula='W = L(m) × W(m) × t(mm) × ρ'
        notes={[
          'Chequered: (X + t) × L × W × ρ (X = 0.3 if t ≤ 3 mm, else 0.4)',
          'Hardox-type: (0.3 + t) × L × W × ρ',
          'Aluminum uses ρ = 2.73',
        ]}
      />
    </div>
  )
}
