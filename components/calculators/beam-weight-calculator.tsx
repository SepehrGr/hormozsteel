'use client'

import { useState } from 'react'

import {
  Field,
  fieldClass,
  selectClass,
  CalculatorActions,
  CalculatorResult,
  FormulaNote,
  DensitySelect,
  STEEL_DENSITIES,
} from './calculator-ui'

export default function BeamWeightCalculator() {
  const [beamType, setBeamType] = useState('IPE')
  const [length, setLength] = useState('')
  const [density, setDensity] = useState('7.85')
  const [height, setHeight] = useState('')
  const [flangeWidth, setFlangeWidth] = useState('')
  const [webThickness, setWebThickness] = useState('')
  const [flangeThickness, setFlangeThickness] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculateWeight = () => {
    const l = parseFloat(length)
    const h = parseFloat(height)
    const fw = parseFloat(flangeWidth)
    const wt = parseFloat(webThickness)
    const ft = parseFloat(flangeThickness)
    const d = parseFloat(density)

    if (!l || !h || !fw || !wt || !ft || !d) return
    const area = h * wt + 2 * fw * ft

    setResult(Math.round(((area * l * d) / 1000) * 100) / 100)
  }

  const resetForm = () => {
    setLength('')
    setHeight('')
    setFlangeWidth('')
    setWebThickness('')
    setFlangeThickness('')
    setResult(null)
  }

  return (
    <div className='space-y-6' dir='ltr'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Field id='beamType' label='Section family'>
          <select
            className={selectClass}
            id='beamType'
            value={beamType}
            onChange={e => setBeamType(e.target.value)}
          >
            <option value='IPE'>IPE</option>
            <option value='INP'>INP</option>
            <option value='IPB'>IPB / HEB (wide flange)</option>
            <option value='CPB'>Castellated</option>
          </select>
        </Field>
        <DensitySelect
          options={STEEL_DENSITIES.filter(d =>
            ['7.85', '8', '7.84', '2.7', '8.96', '8.5'].includes(d.value),
          )}
          value={density}
          onChange={setDensity}
        />
        <Field id='length' label='Length (m)'>
          <input
            className={fieldClass}
            id='length'
            inputMode='decimal'
            placeholder='e.g. 12'
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </Field>
        <Field id='height' label='Overall height (mm)'>
          <input
            className={fieldClass}
            id='height'
            inputMode='decimal'
            placeholder='e.g. 200'
            type='number'
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
        </Field>
        <Field id='flangeWidth' label='Flange width (mm)'>
          <input
            className={fieldClass}
            id='flangeWidth'
            inputMode='decimal'
            placeholder='e.g. 100'
            type='number'
            value={flangeWidth}
            onChange={e => setFlangeWidth(e.target.value)}
          />
        </Field>
        <Field id='flangeThickness' label='Flange thickness (mm)'>
          <input
            className={fieldClass}
            id='flangeThickness'
            inputMode='decimal'
            placeholder='e.g. 8.5'
            type='number'
            value={flangeThickness}
            onChange={e => setFlangeThickness(e.target.value)}
          />
        </Field>
        <Field
          className='sm:col-span-2'
          id='webThickness'
          label='Web thickness (mm)'
        >
          <input
            className={fieldClass}
            id='webThickness'
            inputMode='decimal'
            placeholder='e.g. 5.6'
            type='number'
            value={webThickness}
            onChange={e => setWebThickness(e.target.value)}
          />
        </Field>
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
              {beamType}: h {height} · bf {flangeWidth} · tw {webThickness} · tf{' '}
              {flangeThickness} mm · L {length} m
            </p>
          }
          weightKg={result}
        />
      )}

      <FormulaNote
        formula='W = [(h × tw) + 2 × (bf × tf)] × L × ρ ÷ 1000'
        notes={[
          'Approximate rectangular flange/web model — use mill tables for certified mass',
          'Dimensions in mm, length in m → kg',
        ]}
      />
    </div>
  )
}
