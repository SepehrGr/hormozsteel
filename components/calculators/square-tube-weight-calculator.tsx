'use client'

import { useState } from 'react'

import {
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
} from './calculator-ui'

import { hollowSectionKg } from '@/lib/weight'
import { FormField, Input } from '@/components/ui/field'

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
    setResult(hollowSectionKg(w, l, t, bl, d))
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
        <FormField id='width' label='Section width (mm)'>
          <Input
            className='tabular-nums'
            id='width'
            inputMode='decimal'
            placeholder='e.g. 40'
            type='number'
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
        </FormField>
        <FormField id='sectLength' label='Section depth (mm)'>
          <Input
            className='tabular-nums'
            id='sectLength'
            inputMode='decimal'
            placeholder='e.g. 40'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </FormField>
        <FormField id='thickness' label='Wall thickness (mm)'>
          <Input
            className='tabular-nums'
            id='thickness'
            inputMode='decimal'
            placeholder='e.g. 2'
            type='number'
            value={thickness}
            onChange={e => setThickness(e.target.value)}
          />
        </FormField>
        <FormField id='branchLength' label='Piece length (m)'>
          <Input
            className='tabular-nums'
            id='branchLength'
            inputMode='decimal'
            placeholder='e.g. 6'
            type='number'
            value={branchLength}
            onChange={e => setBranchLength(e.target.value)}
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
              {width} × {length} × t {thickness} mm · L {branchLength} m
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W = [2 × (a + b) − 4t] × t × L × ρ ÷ 1000'
        notes={[
          'a, b, t in mm; L in m → kg',
          'Corners counted once; rounded corners make real tubes a little lighter',
        ]}
      />
    </div>
  )
}
