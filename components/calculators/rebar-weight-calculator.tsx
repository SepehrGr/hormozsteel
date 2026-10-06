'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
  computeLinePrice,
} from './calculator-ui'

import { FormField, Input } from '@/components/ui/field'
import { formatUsd } from '@/lib/format'

interface Props {
  productPrice?: number
  productUnit?: 'kg' | 'ton' | 'piece'
  includeVAT?: boolean
  formatPrice?: (price: number) => string
}

export default function RebarWeightCalculator({
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice = formatUsd,
}: Props) {
  const [diameter, setDiameter] = useState('')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  const calculateWeight = () => {
    const d = parseFloat(diameter)
    const l = parseFloat(length)
    const dens = parseFloat(density)

    if (!d || !l || !dens) return
    const weight = (d * d * Math.PI * l * dens) / 1000
    const w = Math.round(weight * 100) / 100

    setResult(w)
    setTotalPrice(computeLinePrice(w, productPrice, productUnit, includeVAT))
  }

  const resetForm = () => {
    setDiameter('')
    setLength('')
    setResult(null)
    setTotalPrice(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <FormField id='diameter' label='Diameter (mm)'>
          <Input
            className='tabular-nums'
            id='diameter'
            inputMode='decimal'
            placeholder='e.g. 14'
            type='number'
            value={diameter}
            onChange={e => setDiameter(e.target.value)}
          />
        </FormField>
        <FormField id='length' label='Bar length (m)'>
          <Input
            className='tabular-nums'
            id='length'
            inputMode='decimal'
            placeholder='e.g. 12'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </FormField>
        <div className='sm:col-span-2'>
          <DensitySelect value={density} onChange={setDensity} />
        </div>
      </div>

      <CalculatorActions
        calculateLabel='Calculate weight'
        onCalculate={calculateWeight}
        onReset={resetForm}
      />

      {result != null && (
        <CalculatorResult
          details={
            <>
              <p>
                Ø {diameter} mm · L {length} m · ρ {density}
              </p>
              <p>
                kg/m ≈{' '}
                {(
                  (parseFloat(diameter) ** 2 * Math.PI * parseFloat(density)) /
                  1000
                ).toFixed(3)}
              </p>
            </>
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
        formula='W = (d² × π × L × ρ) ÷ 1000'
        notes={[
          'd in mm, L in m, ρ in g/cm³ → W in kg',
          'Same relation for ribbed and plain bar',
        ]}
      />
    </div>
  )
}
