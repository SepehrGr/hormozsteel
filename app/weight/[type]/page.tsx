import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import Link from 'next/link'

import WeightCalculator from '@/components/calculators/weight-calculator'
import {
  WEIGHT_CALCULATORS,
  type WeightCalculatorType,
} from '@/config/weight-calculators'

type WeightPageProps = {
  params: Promise<{ type: string }>
}

export async function generateMetadata({
  params,
}: WeightPageProps): Promise<Metadata> {
  const { type } = await params
  const info = WEIGHT_CALCULATORS[type as WeightCalculatorType]

  if (!info) return { title: 'Weight calculator' }

  return {
    title: `${info.title} calculator`,
    description: info.description,
  }
}

export async function generateStaticParams() {
  return Object.keys(WEIGHT_CALCULATORS).map(type => ({ type }))
}

export default async function WeightCalculatorPage({
  params,
}: WeightPageProps) {
  const { type } = await params
  const calculatorInfo = WEIGHT_CALCULATORS[type as WeightCalculatorType]

  if (!calculatorInfo) notFound()

  return (
    <div className='w-full'>
      <header className='border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12'>
          <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Weight calculators
          </p>
          <div className='grid gap-6 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-8'>
              <h1 className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                {calculatorInfo.title}
              </h1>
              <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                {calculatorInfo.description} Results in kilograms. Density
                defaults suit carbon steel mill products.
              </p>
            </div>
            <dl className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:col-span-4'>
              <div className='bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Output
                </dt>
                <dd className='text-sm font-medium text-foreground'>kg</dd>
              </div>
              <div className='bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Inputs
                </dt>
                <dd className='text-sm font-medium text-foreground'>mm · m</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className='py-10 border-b border-border bg-muted/40'>
        <div className='mx-auto grid max-w-7xl gap-px overflow-hidden border-x border-border bg-border lg:grid-cols-12'>
          {/* Calculator board */}
          <div className='bg-card lg:col-span-8'>
            <div className='flex items-center justify-between border-b border-border px-5 py-3 md:px-6'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Inputs
              </h2>
              <span className='text-xs text-muted-foreground'>
                Indicative · not a mill cert
              </span>
            </div>
            <div className='px-5 py-6 md:px-6 md:py-8'>
              <WeightCalculator type={type as WeightCalculatorType} />
            </div>
          </div>

          {/* Other calculators */}
          <aside className='bg-card lg:col-span-4'>
            <div className='border-b border-border px-5 py-3 md:px-6'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                All calculators
              </h2>
            </div>
            <nav aria-label='Weight calculators'>
              <ul className='divide-y divide-border'>
                {Object.entries(WEIGHT_CALCULATORS).map(([key, info]) => {
                  const active = type === key

                  return (
                    <li key={key}>
                      <Link
                        className={`block px-5 py-3.5 transition-colors duration-200 ease-out md:px-6 ${
                          active
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`}
                        href={`/weight/${key}`}
                        scroll={false}
                      >
                        <span className='block text-sm font-medium text-foreground'>
                          {info.label}
                        </span>
                        <span className='mt-0.5 block text-xs leading-snug text-muted-foreground'>
                          {info.description}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  )
}
