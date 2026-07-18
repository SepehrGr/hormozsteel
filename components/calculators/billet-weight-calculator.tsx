'use client'

import { useState } from 'react'
import {
  Field,
  fieldClass,
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

export default function BilletWeightCalculator() {
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const l = parseFloat(length)
    const w = parseFloat(width) / 1000
    const h = parseFloat(height) / 1000
    const d = parseFloat(density)
    if (!l || !w || !h || !d) return
    // l m × w m × h m × d t/m³ → tonnes; ×1000 → kg
    const weight = l * w * h * d * 1000
    setResult(Math.round(weight * 100) / 100)
  }

  const resetForm = () => {
    setLength('')
    setWidth('')
    setHeight('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='length' label='Length (m)'>
          <input
            id='length'
            type='number'
            inputMode='decimal'
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder='e.g. 6 or 12'
            className={fieldClass}
          />
        </Field>
        <Field id='width' label='Section width (mm)'>
          <input
            id='width'
            type='number'
            inputMode='decimal'
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder='e.g. 150'
            className={fieldClass}
          />
        </Field>
        <Field id='height' label='Section height (mm)'>
          <input
            id='height'
            type='number'
            inputMode='decimal'
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder='e.g. 150'
            className={fieldClass}
          />
        </Field>
        <DensitySelect value={density} onChange={setDensity} />
      </div>

      <CalculatorActions
        onCalculate={calculateWeight}
        onReset={resetForm}
        calculateLabel='Calculate weight'
      />

      {result != null && (
        <CalculatorResult
          weightKg={result}
          details={
            <>
              <p>
                {width} × {height} mm · L {length} m · ρ {density}
              </p>
              <p>
                ≈ {(result / 1000).toLocaleString('en-US', {
                  maximumFractionDigits: 3,
                })}{' '}
                t
              </p>
            </>
          }
        />
      )}

      <FormulaNote
        formula='W(kg) = L(m) × a(m) × b(m) × ρ × 1000'
        notes={['Section sides entered in mm; converted to metres in the formula']}
      />
    </div>
  )
}
