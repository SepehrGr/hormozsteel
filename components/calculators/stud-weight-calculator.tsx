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

export default function StudWeightCalculator() {
  const [flangeWidth, setFlangeWidth] = useState('')
  const [flangeThickness, setFlangeThickness] = useState('')
  const [webHeight, setWebHeight] = useState('')
  const [webThickness, setWebThickness] = useState('')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const fw = parseFloat(flangeWidth)
    const ft = parseFloat(flangeThickness)
    const wh = parseFloat(webHeight)
    const wt = parseFloat(webThickness)
    const l = parseFloat(length)
    const d = parseFloat(density)
    if (!fw || !ft || !wh || !wt || !l || !d) return
    const area = wt * wh + 2 * ft * fw
    setResult(Math.round(((area * l * d) / 1000) * 100) / 100)
  }

  const resetForm = () => {
    setFlangeWidth('')
    setFlangeThickness('')
    setWebHeight('')
    setWebThickness('')
    setLength('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='flangeWidth' label='Flange width (mm)'>
          <input
            id='flangeWidth'
            type='number'
            inputMode='decimal'
            value={flangeWidth}
            onChange={e => setFlangeWidth(e.target.value)}
            placeholder='e.g. 50'
            className={fieldClass}
          />
        </Field>
        <Field id='flangeThickness' label='Flange thickness (mm)'>
          <input
            id='flangeThickness'
            type='number'
            inputMode='decimal'
            value={flangeThickness}
            onChange={e => setFlangeThickness(e.target.value)}
            placeholder='e.g. 4'
            className={fieldClass}
          />
        </Field>
        <Field id='webHeight' label='Web height (mm)'>
          <input
            id='webHeight'
            type='number'
            inputMode='decimal'
            value={webHeight}
            onChange={e => setWebHeight(e.target.value)}
            placeholder='e.g. 100'
            className={fieldClass}
          />
        </Field>
        <Field id='webThickness' label='Web thickness (mm)'>
          <input
            id='webThickness'
            type='number'
            inputMode='decimal'
            value={webThickness}
            onChange={e => setWebThickness(e.target.value)}
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
              Channel · bf {flangeWidth} · tf {flangeThickness} · h{' '}
              {webHeight} · tw {webThickness} mm · L {length} m
            </p>
          }
        />
      )}

      <FormulaNote
        formula='W = [(tw × h) + 2 × (tf × bf)] × L × ρ ÷ 1000'
        notes={['Approximate channel model — verify against mill tables']}
      />
    </div>
  )
}
