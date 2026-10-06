'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

import { FormField, Input } from '@/components/ui/field'

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
        <FormField id='flangeWidth' label='Flange width (mm)'>
          <Input
            className='tabular-nums'
            id='flangeWidth'
            inputMode='decimal'
            placeholder='e.g. 50'
            type='number'
            value={flangeWidth}
            onChange={e => setFlangeWidth(e.target.value)}
          />
        </FormField>
        <FormField id='flangeThickness' label='Flange thickness (mm)'>
          <Input
            className='tabular-nums'
            id='flangeThickness'
            inputMode='decimal'
            placeholder='e.g. 4'
            type='number'
            value={flangeThickness}
            onChange={e => setFlangeThickness(e.target.value)}
          />
        </FormField>
        <FormField id='webHeight' label='Web height (mm)'>
          <Input
            className='tabular-nums'
            id='webHeight'
            inputMode='decimal'
            placeholder='e.g. 100'
            type='number'
            value={webHeight}
            onChange={e => setWebHeight(e.target.value)}
          />
        </FormField>
        <FormField id='webThickness' label='Web thickness (mm)'>
          <Input
            className='tabular-nums'
            id='webThickness'
            inputMode='decimal'
            placeholder='e.g. 3'
            type='number'
            value={webThickness}
            onChange={e => setWebThickness(e.target.value)}
          />
        </FormField>
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
            <p>
              Channel · bf {flangeWidth} · tf {flangeThickness} · h {webHeight}{' '}
              · tw {webThickness} mm · L {length} m
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W = [(tw × h) + 2 × (tf × bf)] × L × ρ ÷ 1000'
        notes={['Approximate channel model — verify against mill tables']}
      />
    </div>
  )
}
