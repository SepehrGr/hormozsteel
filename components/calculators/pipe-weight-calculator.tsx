'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

import { pipeKg } from '@/lib/weight'
import { FormField, Input } from '@/components/ui/field'

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
    setResult(pipeKg(od, t, l, d))
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
        <FormField id='outerDiameter' label='Outside diameter (mm)'>
          <Input
            className='tabular-nums'
            id='outerDiameter'
            inputMode='decimal'
            placeholder='e.g. 60.3'
            type='number'
            value={outerDiameter}
            onChange={e => setOuterDiameter(e.target.value)}
          />
        </FormField>
        <FormField id='thickness' label='Wall thickness (mm)'>
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
              OD {outerDiameter} mm · t {thickness} mm · L {length} m · ρ{' '}
              {density}
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W = π × (OD − t) × t × L × ρ ÷ 1000'
        notes={[
          'Mean diameter = OD − wall thickness',
          'Units: mm, m, g/cm³ → kg',
        ]}
      />
    </div>
  )
}
