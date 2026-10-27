import { Fragment } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

import RebarEstimate from './rebar-estimate'
import SectionHead from './section-head'

import { WEIGHT_CALCULATORS } from '@/config/weight-calculators'

const link =
  'text-foreground underline decoration-border underline-offset-4 transition-colors duration-200 ease-out hover:decoration-amber-700 dark:hover:decoration-amber-500'

const tick = 'mt-1 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-500'

export default function WeighSection({
  rates,
}: {
  rates: Record<number, number>
}) {
  const calculators = Object.entries(WEIGHT_CALCULATORS)

  return (
    <section className='border-b border-border bg-muted/30'>
      <div className='mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16'>
        <div>
          <SectionHead title='Work out the weight in seconds'>
            Turn a bar schedule into tonnage and a budget at today&apos;s rate
            before you ask for a firm price.
          </SectionHead>
          <ul className='mt-8 space-y-4 text-muted-foreground'>
            <li className='flex gap-3'>
              <Check aria-hidden className={tick} />
              <span>
                Calculators for{' '}
                {calculators.map(([type, calculator], i) => (
                  <Fragment key={type}>
                    <Link className={link} href={`/weight/${type}`}>
                      {calculator.label.toLowerCase()}
                    </Link>
                    {i < calculators.length - 2
                      ? ', '
                      : i === calculators.length - 2
                        ? ' and '
                        : ''}
                  </Fragment>
                ))}
              </span>
            </li>
            <li className='flex gap-3'>
              <Check aria-hidden className={tick} />
              <span>Priced at today&apos;s catalog rate for each size</span>
            </li>
            <li className='flex gap-3'>
              <Check aria-hidden className={tick} />
              <span>
                Send the tonnage with your{' '}
                <Link className={link} href='/contact'>
                  quote request
                </Link>
              </span>
            </li>
          </ul>
        </div>

        {Object.keys(rates).length > 0 && <RebarEstimate rates={rates} />}
      </div>
    </section>
  )
}
