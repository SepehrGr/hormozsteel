import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import SheetWeightCalculator from '@/components/calculators/sheet-weight-calculator'
import BeamWeightCalculator from '@/components/calculators/beam-weight-calculator'
import RebarWeightCalculator from '@/components/calculators/rebar-weight-calculator'
import BilletWeightCalculator from '@/components/calculators/billet-weight-calculator'
import PipeWeightCalculator from '@/components/calculators/pipe-weight-calculator'
import StudWeightCalculator from '@/components/calculators/stud-weight-calculator'
import AngleWeightCalculator from '@/components/calculators/angle-weight-calculator'
import SquareTubeWeightCalculator from '@/components/calculators/square-tube-weight-calculator'

type WeightPageProps = {
  params: Promise<{ type: string }>
}

export const WEIGHT_CALCULATORS = {
  rebar: {
    title: 'Rebar weight',
    description: 'Ribbed and plain bar by diameter and bar length.',
  },
  beam: {
    title: 'Beam weight',
    description: 'IPE / INP / HE-style sections from flange and web dims.',
  },
  sheet: {
    title: 'Sheet weight',
    description: 'Plate and coil sheet by length, width, and thickness.',
  },
  pipe: {
    title: 'Pipe weight',
    description: 'Round pipe from OD, wall thickness, and length.',
  },
  angle: {
    title: 'Angle weight',
    description: 'Equal and unequal leg angles.',
  },
  stud: {
    title: 'Channel weight',
    description: 'U-channel / stud sections from flange and web dims.',
  },
  'square-tube': {
    title: 'Hollow section weight',
    description: 'SHS / RHS tubes by section size and wall thickness.',
  },
  billet: {
    title: 'Billet weight',
    description: 'Square billet section × length.',
  },
} as const

type CalcKey = keyof typeof WEIGHT_CALCULATORS

export async function generateMetadata({
  params,
}: WeightPageProps): Promise<Metadata> {
  const { type } = await params
  const info = WEIGHT_CALCULATORS[type as CalcKey]
  if (!info) return { title: 'Weight calculator' }
  return {
    title: `${info.title} calculator`,
    description: info.description,
  }
}

export async function generateStaticParams() {
  return Object.keys(WEIGHT_CALCULATORS).map(type => ({ type }))
}

function renderCalculator(type: string) {
  switch (type) {
    case 'sheet':
      return <SheetWeightCalculator />
    case 'beam':
      return <BeamWeightCalculator />
    case 'rebar':
      return <RebarWeightCalculator />
    case 'billet':
      return <BilletWeightCalculator />
    case 'pipe':
      return <PipeWeightCalculator />
    case 'stud':
      return <StudWeightCalculator />
    case 'angle':
      return <AngleWeightCalculator />
    case 'square-tube':
      return <SquareTubeWeightCalculator />
    default:
      return (
        <p className='text-sm text-muted-foreground'>
          Calculator not available.
        </p>
      )
  }
}

export default async function WeightCalculatorPage({
  params,
}: WeightPageProps) {
  const { type } = await params
  const calculatorInfo = WEIGHT_CALCULATORS[type as CalcKey]
  if (!calculatorInfo) notFound()

  return (
    <div className='w-full' dir='ltr'>
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
                  Layout
                </dt>
                <dd className='text-sm font-medium text-foreground'>LTR</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div className='border-b border-border bg-muted/40'>
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
              {renderCalculator(type)}
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
                        href={`/weight/${key}`}
                        scroll={false}
                        className={`block px-5 py-3.5 transition-colors duration-200 ease-out md:px-6 ${
                          active
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        <span className='block text-sm font-medium text-foreground'>
                          {info.title}
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
