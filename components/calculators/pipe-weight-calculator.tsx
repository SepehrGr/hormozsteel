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

export default function PipeWeightCalculator() {
  const [outerDiameter, setOuterDiameter] = useState('')
  const [thickness, setThickness] = useState('')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const od = parseFloat(outerDiameter)
    const t = parseFloat(thickness)
    const l = parseFloat(length)
    const d = parseFloat(density)
    if (!od || !t || !l || !d) return
    const meanDiameter = od - t
    const weight = (Math.PI * meanDiameter * t * l * d) / 1000
    setResult(Math.round(weight * 100) / 100)
  }

  const resetForm = () => {
    setOuterDiameter('')
    setThickness('')
    setLength('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='outerDiameter' label='Outside diameter (mm)'>
          <input
            id='outerDiameter'
            type='number'
            inputMode='decimal'
            value={outerDiameter}
            onChange={e => setOuterDiameter(e.target.value)}
            placeholder='e.g. 60.3'
            className={fieldClass}
          />
        </Field>
        <Field id='thickness' label='Wall thickness (mm)'>
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
            <p>
              OD {outerDiameter} mm · t {thickness} mm · L {length} m · ρ{' '}
              {density}
            </p>
          }
        />
      )}

      <FormulaNote
        formula='W = π × (OD − t) × t × L × ρ ÷ 1000'
        notes={['Mean diameter = OD − wall thickness', 'Units: mm, m, g/cm³ → kg']}
      />
    </div>
  )
}
