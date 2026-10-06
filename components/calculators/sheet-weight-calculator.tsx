'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
  computeLinePrice,
  STEEL_DENSITIES,
} from './calculator-ui'

import { FormField, Input, Select } from '@/components/ui/field'
import { formatUsd } from '@/lib/format'

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
        <FormField id='sheetType' label='Sheet type'>
          <Select
            id='sheetType'
            value={sheetType}
            onChange={e => setSheetType(e.target.value)}
          >
            {SHEET_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>
        <DensitySelect
          options={STEEL_DENSITIES.filter(d =>
            ['7.85', '8', '7.86', '7.84', '2.73'].includes(d.value),
          )}
          value={density}
          onChange={setDensity}
        />
        <FormField id='length' label='Length (m)'>
          <Input
            className='tabular-nums'
            id='length'
            inputMode='decimal'
            placeholder='e.g. 6'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </FormField>
        <FormField id='width' label='Width (m)'>
          <Input
            className='tabular-nums'
            id='width'
            inputMode='decimal'
            placeholder='e.g. 1.5'
            type='number'
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
        </FormField>
        <FormField
          className='sm:col-span-2'
          id='thickness'
          label='Thickness (mm)'
        >
          <Input
            className='tabular-nums'
            id='thickness'
            inputMode='decimal'
            placeholder='e.g. 3'
            type='number'
            value={thickness}
            onChange={e => setThickness(e.target.value)}
          />
        </FormField>
      </div>

      <CalculatorActions
        calculateLabel='Calculate weight'
        onCalculate={calculateWeight}
        onReset={resetForm}
      />

      {result != null && (
        <CalculatorResult
          details={
            <p>
              {typeLabel}: {length} m × {width} m × {thickness} mm · ρ{' '}
              {sheetType === 'aluminum' ? '2.73' : density}
            </p>
          }
          priceLabel={
            totalPrice != null
              ? `${formatPrice(totalPrice)}${includeVAT ? ' incl. tax' : ''}`
              : undefined
          }
          totalPrice={totalPrice}
          weightKg={result}
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
