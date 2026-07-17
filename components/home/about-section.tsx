import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    code: '01',
    title: 'Scan the board',
    body: 'Open a product family — rebar, HRC/CRC, sections, pipe — and read unit rates with size and mill at a glance.',
  },
  {
    code: '02',
    title: 'Filter the line',
    body: 'Narrow by diameter, section, stock, or mill so the table matches the takeoff, not the whole warehouse.',
  },
  {
    code: '03',
    title: 'Request a firm quote',
    body: 'Send tonnage and specs to sales. Indicative catalog prices become a binding offer with delivery terms.',
  },
]

export default function AboutSection() {
  return (
    <section className='w-full border-b border-border bg-muted/30'>
      <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-15'>
        <div className='grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start'>
          {/* Editorial column */}
          <div className='lg:col-span-5'>
            <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
              Why Hormoz Steel
            </p>
            <h2 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight'>
              Built for engineers and buyers who live in spreadsheets
            </h2>
            <p className='mt-4 text-sm leading-relaxed text-muted-foreground md:text-base'>
              We publish clear unit prices so procurement can compare lines
              before the phone call. No marketing fog — just the sizes, mills,
              and rates you need to estimate a job and move to a quote.
            </p>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              Catalog rates are USD, ex-works style. Final pricing follows
              tonnage, grade, and logistics agreed with sales.
            </p>
          </div>

          {/* Process board */}
          <div className='lg:col-span-7'>
            <div className='overflow-hidden border border-border bg-border shadow-sm dark:shadow-none'>
              <div className='flex items-center justify-between border-b border-border bg-card px-4 py-3'>
                <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  How procurement works
                </h3>
                <span className='text-xs text-muted-foreground'>3 steps</span>
              </div>

              <ol className='divide-y divide-border bg-card'>
                {steps.map(step => (
                  <li
                    key={step.code}
                    className='grid grid-cols-[auto_1fr] gap-4 px-4 py-5 transition-colors duration-200 ease-out sm:gap-6 sm:px-5 hover:bg-muted/60'
                  >
                    <span className='font-mono text-sm font-semibold tabular-nums text-amber-800 dark:text-amber-500'>
                      {step.code}
                    </span>
                    <div className='min-w-0'>
                      <h4 className='text-sm font-semibold tracking-tight text-foreground sm:text-base'>
                        {step.title}
                      </h4>
                      <p className='mt-1.5 text-sm leading-relaxed text-muted-foreground'>
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className='border-t border-border bg-muted/50 px-4 py-3 sm:px-5'>
                <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
                  <span>
                    Coverage:{' '}
                    <span className='text-foreground'>
                      rebar · sheet · beams · pipe · billets
                    </span>
                  </span>
                  <Link
                    href='/about'
                    className='font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
                  >
                    Company overview →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
