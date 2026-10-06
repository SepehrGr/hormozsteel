'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

import { FormField, Input } from '@/components/ui/field'
import { formatNumber } from '@/lib/format'

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
        <FormField id='length' label='Length (m)'>
          <Input
            className='tabular-nums'
            id='length'
            inputMode='decimal'
            placeholder='e.g. 6 or 12'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </FormField>
        <FormField id='width' label='Section width (mm)'>
          <Input
            className='tabular-nums'
            id='width'
            inputMode='decimal'
            placeholder='e.g. 150'
            type='number'
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
        </FormField>
        <FormField id='height' label='Section height (mm)'>
          <Input
            className='tabular-nums'
            id='height'
            inputMode='decimal'
            placeholder='e.g. 150'
            type='number'
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
        </FormField>
        <DensitySelect value={density} onChange={setDensity} />
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
                {width} × {height} mm · L {length} m · ρ {density}
              </p>
              <p>≈ {formatNumber(result / 1000)} t</p>
            </>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W(kg) = L(m) × a(m) × b(m) × ρ × 1000'
        notes={[
          'Section sides entered in mm; converted to metres in the formula',
        ]}
      />
    </div>
  )
}
