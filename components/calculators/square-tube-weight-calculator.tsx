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
            className={fieldClass}
            id='width'
            inputMode='decimal'
            placeholder='e.g. 40'
            type='number'
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
        </Field>
        <Field id='sectLength' label='Section depth (mm)'>
          <input
            className={fieldClass}
            id='sectLength'
            inputMode='decimal'
            placeholder='e.g. 40'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </Field>
        <Field id='thickness' label='Wall thickness (mm)'>
          <input
            className={fieldClass}
            id='thickness'
            inputMode='decimal'
            placeholder='e.g. 2'
            type='number'
            value={thickness}
            onChange={e => setThickness(e.target.value)}
          />
        </Field>
        <Field id='branchLength' label='Piece length (m)'>
          <input
            className={fieldClass}
            id='branchLength'
            inputMode='decimal'
            placeholder='e.g. 6'
            type='number'
            value={branchLength}
            onChange={e => setBranchLength(e.target.value)}
          />
        </Field>
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
            <p>
              {width} × {length} × t {thickness} mm · L {branchLength} m
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W = 2 × (a + b) × ρ × t × L ÷ 1000'
        notes={['a, b, t in mm; L in m → kg (SHS / RHS approximation)']}
      />
    </div>
  )
}
