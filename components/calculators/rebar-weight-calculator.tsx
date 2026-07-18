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
} from './calculator-ui'

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
    setTotalPrice(
      computeLinePrice(w, productPrice, productUnit, includeVAT),
    )
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
        <Field id='diameter' label='Diameter (mm)'>
          <input
            id='diameter'
            type='number'
            inputMode='decimal'
            value={diameter}
            onChange={e => setDiameter(e.target.value)}
            placeholder='e.g. 14'
            className={fieldClass}
          />
        </Field>
        <Field id='length' label='Bar length (m)'>
          <input
            id='length'
            type='number'
            inputMode='decimal'
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder='e.g. 12'
            className={fieldClass}
          />
        </Field>
        <div className='sm:col-span-2'>
          <DensitySelect value={density} onChange={setDensity} />
        </div>
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
