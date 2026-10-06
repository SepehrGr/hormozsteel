'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

import { FormField, Input } from '@/components/ui/field'

export default function AngleWeightCalculator() {
  const [wing1Length, setWing1Length] = useState('')
  const [wing2Length, setWing2Length] = useState('')
  const [thickness, setThickness] = useState('')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const w1 = parseFloat(wing1Length)
    const w2 = parseFloat(wing2Length) || w1
    const t = parseFloat(thickness)
    const l = parseFloat(length)
    const d = parseFloat(density)

    if (!w1 || !t || !l || !d) return
    const weight =
      w2 === w1 ? (d * l * t * w1 * 2) / 1000 : (d * l * t * (w1 + w2)) / 1000

    setResult(Math.round(weight * 100) / 100)
  }

  const resetForm = () => {
    setWing1Length('')
    setWing2Length('')
    setThickness('')
    setLength('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <FormField id='wing1' label='Leg A (mm)'>
          <Input
            className='tabular-nums'
            id='wing1'
            inputMode='decimal'
            placeholder='e.g. 50'
            type='number'
            value={wing1Length}
            onChange={e => setWing1Length(e.target.value)}
          />
        </FormField>
        <FormField id='wing2' label='Leg B (mm) — blank if equal'>
          <Input
            className='tabular-nums'
            id='wing2'
            inputMode='decimal'
            placeholder='e.g. 50'
            type='number'
            value={wing2Length}
            onChange={e => setWing2Length(e.target.value)}
          />
        </FormField>
        <FormField id='thickness' label='Thickness (mm)'>
          <Input
            className='tabular-nums'
            id='thickness'
            inputMode='decimal'
            placeholder='e.g. 5'
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
              {wing2Length && wing2Length !== wing1Length
                ? `${wing1Length}×${wing2Length}`
                : `${wing1Length} equal leg`}{' '}
              × t {thickness} mm · L {length} m
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='Equal: W = ρ × L × t × a × 2 ÷ 1000 · Unequal: W = ρ × L × t × (a+b) ÷ 1000'
        notes={['Legs and thickness in mm, length in m']}
      />
    </div>
  )
}
