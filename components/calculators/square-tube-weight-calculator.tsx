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

export default function SquareTubeWeightCalculator() {
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [thickness, setThickness] = useState('')
  const [branchLength, setBranchLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const w = parseFloat(width)
    const l = parseFloat(length)
    const t = parseFloat(thickness)
    const bl = parseFloat(branchLength)
    const d = parseFloat(density)
    if (!w || !l || !t || !bl || !d) return
    const weight = (2 * (w + l) * d * t * bl) / 1000
    setResult(Math.round(weight * 100) / 100)
  }

  const resetForm = () => {
    setWidth('')
    setLength('')
    setThickness('')
    setBranchLength('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='width' label='Section width (mm)'>
          <input
            id='width'
            type='number'
            inputMode='decimal'
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder='e.g. 40'
            className={fieldClass}
          />
        </Field>
        <Field id='sectLength' label='Section depth (mm)'>
          <input
            id='sectLength'
            type='number'
            inputMode='decimal'
            value={length}
            onChange={e => setLength(e.target.value)}
            placeholder='e.g. 40'
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
            placeholder='e.g. 2'
            className={fieldClass}
          />
        </Field>
        <Field id='branchLength' label='Piece length (m)'>
          <input
            id='branchLength'
            type='number'
            inputMode='decimal'
            value={branchLength}
            onChange={e => setBranchLength(e.target.value)}
            placeholder='e.g. 6'
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
          details={
            <p>
              {width} × {length} × t {thickness} mm · L {branchLength} m
            </p>
          }
        />
      )}

      <FormulaNote
        formula='W = 2 × (a + b) × ρ × t × L ÷ 1000'
        notes={['a, b, t in mm; L in m → kg (SHS / RHS approximation)']}
      />
    </div>
  )
}
