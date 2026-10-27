'use client'

import { useState } from 'react'

import { FormField, Input, Select } from '@/components/ui/field'
import { formatNumber, formatUsd } from '@/lib/format'
import { rebarKg } from '@/lib/weight'

const CARBON_STEEL = 7.85

/** Live weight and price for a run of ribbed bars, priced at each diameter's catalog rate. */
export default function RebarEstimate({
  rates,
}: {
  rates: Record<number, number>
}) {
  const diameters = Object.keys(rates)
    .map(Number)
    .sort((a, b) => a - b)
  const [diameter, setDiameter] = useState(
    diameters.includes(18) ? 18 : diameters[0],
  )
  const [length, setLength] = useState('12')
  const [bars, setBars] = useState('400')

  const kg =
    rebarKg(diameter, Number(length) || 0, CARBON_STEEL) * (Number(bars) || 0)
  const rate = rates[diameter]

  return (
    <form
      className='border border-border bg-card p-5 sm:p-7'
      onSubmit={e => e.preventDefault()}
    >
      <h3 className='text-lg font-semibold tracking-tight text-foreground'>
        Rebar weight
      </h3>
      <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3'>
        <FormField
          className='col-span-2 sm:col-span-1'
          id='estimate-diameter'
          label='Diameter'
        >
          <Select
            id='estimate-diameter'
            value={diameter}
            onChange={e => setDiameter(Number(e.target.value))}
          >
            {diameters.map(d => (
              <option key={d} value={d}>
                Ø {d} mm
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id='estimate-length' label='Length, m'>
          <Input
            className='tabular-nums'
            id='estimate-length'
            inputMode='decimal'
            min={0}
            type='number'
            value={length}
            onChange={e => setLength(e.target.value)}
          />
        </FormField>
        <FormField id='estimate-bars' label='Bars'>
          <Input
            className='tabular-nums'
            id='estimate-bars'
            inputMode='numeric'
            min={0}
            type='number'
            value={bars}
            onChange={e => setBars(e.target.value)}
          />
        </FormField>
      </div>

      <dl
        aria-live='polite'
        className='mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5'
      >
        <div>
          <dt className='text-sm text-muted-foreground'>Weight</dt>
          <dd className='mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl'>
            {kg >= 1000
              ? `${formatNumber(kg / 1000, 2)} t`
              : `${formatNumber(kg, 0)} kg`}
          </dd>
        </div>
        <div>
          <dt className='text-sm text-muted-foreground'>
            At today&apos;s rate
          </dt>
          <dd className='mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl'>
            {rate != null ? formatUsd(kg * rate, { whole: true }) : '—'}
          </dd>
        </div>
      </dl>
      <p className='mt-4 text-sm text-muted-foreground'>
        Ribbed rebar at{' '}
        {rate != null ? `${formatUsd(rate)}/kg` : 'no listed rate'}. A firm
        price follows tonnage and delivery.
      </p>
    </form>
  )
}
