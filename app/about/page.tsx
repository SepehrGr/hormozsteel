import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const facts = [
  { label: 'Founded', value: '1993' },
  { label: 'Steel trading', value: 'Since 2019' },
  { label: 'Base', value: 'Bandar Abbas' },
  { label: 'Currency', value: 'USD · catalog' },
]

const productLines = [
  'Reinforcing bar (ribbed & plain)',
  'Hot- and cold-rolled sheet (HRC / CRC)',
  'Structural beams & sections (IPE, HEA, HEB)',
  'Pipe, hollow sections, angles & channels',
  'Wire, mesh, and billets',
]

const orderSteps = [
  {
    code: '01',
    title: 'Review unit prices',
    body: 'Open the catalog board, filter by size and mill, and shortlist lines that match the takeoff.',
  },
  {
    code: '02',
    title: 'Confirm the spec',
    body: 'Note grade, section, length, tonnage, and delivery city so sales can price without rework.',
  },
  {
    code: '03',
    title: 'Request a proforma',
    body: 'Contact sales for a firm quote. Catalog rates are indicative; final terms follow agreed logistics.',
  },
  {
    code: '04',
    title: 'Settle and schedule load-out',
    body: 'Deposit against proforma, then coordinate loading and transport with the desk.',
  },
]

const buyChecklist = [
  {
    title: 'Product & standard',
    body: 'Family (rebar, beam, sheet…), dimensions, grade (e.g. A3, ST37), and relevant standard.',
  },
  {
    title: 'Volume & timing',
    body: 'Tonnage or piece count, preferred ship window, and whether partial loads are acceptable.',
  },
  {
    title: 'Mill & quality',
    body: 'Preferred mills where applicable; inspection or mill cert requirements before dispatch.',
  },
  {
    title: 'Logistics',
    body: 'Delivery city, site access, and who handles freight — so landed cost is clear.',
  },
]

/**
 * About — clean editorial + board sections, theme tokens.
 */
export default function AboutPage() {
  return (
    <div className='w-full'>
      {/* Page header */}
      <header className='border-b border-border'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
          <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Company
          </p>
          <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-7'>
              <h1 className='max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                Hormoz Steel
              </h1>
              <p className='mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                Industrial steel supply for construction and fabrication —
                transparent unit prices, clear specs, and a sales desk built for
                procurement timelines.
              </p>
            </div>
            <div className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:col-span-5'>
              {facts.map(fact => (
                <div key={fact.label} className='bg-card px-4 py-3'>
                  <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                    {fact.label}
                  </dt>
                  <dd className='mt-0.5 text-sm font-medium text-foreground'>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Story */}
      <section className='border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16'>
          <div className='grid gap-10 lg:grid-cols-12 lg:gap-16'>
            <div className='lg:col-span-4'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Overview
              </h2>
              <p className='mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
                From construction roots to a full steel catalog
              </p>
            </div>
            <div className='space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base lg:col-span-8'>
              <p>
                Beton Payam Hormoz began in construction in{' '}
                <span className='font-medium text-foreground'>1993</span>,
                building a reputation on reliable delivery and job-site
                discipline. That background still shapes how we trade steel
                today: specs first, then price, then logistics.
              </p>
              <p>
                Since <span className='font-medium text-foreground'>2019</span>{' '}
                we have expanded into mill products — rebar, beams, sheet, pipe,
                profiles, and related lines — serving buyers who need
                predictable unit rates and clear communication with sales.
              </p>
              <p>
                Catalog prices on this site are published in USD on an
                ex-works–style basis for planning. Firm quotes account for
                tonnage, grade, mill, and transport once you contact the desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product coverage */}
      <section className='border-b border-border bg-muted/40'>
        <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16'>
          <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Product coverage
              </h2>
              <p className='mt-2 text-lg font-semibold tracking-tight text-foreground'>
                Lines we quote every day
              </p>
            </div>
            <Link
              href='/products'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
            >
              Open catalog
              <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
          <ul className='grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3'>
            {productLines.map(line => (
              <li
                key={line}
                className='bg-card px-5 py-4 text-sm text-foreground'
              >
                {line}
              </li>
            ))}
            <li className='bg-card px-5 py-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1'>
              Full boards with sizes, mills, and unit rates live in the catalog.
            </li>
          </ul>
        </div>
      </section>

      {/* How to order */}
      <section className='border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16'>
          <div className='mb-6'>
            <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Ordering
            </h2>
            <p className='mt-2 text-lg font-semibold tracking-tight text-foreground'>
              From board to load-out
            </p>
          </div>
          <ol className='overflow-hidden border border-border bg-border'>
            {orderSteps.map(step => (
              <li
                key={step.code}
                className='grid grid-cols-[auto_1fr] gap-4 border-b border-border bg-card px-5 py-5 last:border-b-0 sm:gap-6 sm:px-6'
              >
                <span className='font-mono text-sm font-semibold tabular-nums text-muted-foreground'>
                  {step.code}
                </span>
                <div>
                  <h3 className='text-sm font-semibold text-foreground sm:text-base'>
                    {step.title}
                  </h3>
                  <p className='mt-1.5 text-sm leading-relaxed text-muted-foreground'>
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Buying checklist */}
      <section className='border-b border-border bg-muted/40'>
        <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16'>
          <div className='mb-6 max-w-2xl'>
            <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Before you call sales
            </h2>
            <p className='mt-2 text-lg font-semibold tracking-tight text-foreground'>
              Have these details ready
            </p>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Clear inputs mean a faster proforma and fewer revisions on grade,
              size, or freight.
            </p>
          </div>
          <div className='grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2'>
            {buyChecklist.map((item, i) => (
              <article key={item.title} className='bg-card px-5 py-5 sm:px-6'>
                <h3 className='text-sm font-semibold text-foreground'>
                  <span className='mr-2 font-mono text-xs text-muted-foreground'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.title}
                </h3>
                <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='border-b border-border bg-background'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-14'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
              Ready to price a package?
            </h2>
            <p className='mt-2 max-w-lg text-sm text-muted-foreground'>
              Browse live unit rates or send specs to sales for a firm quote.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/products'
              className='inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            >
              Browse catalog
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href='/contact'
              className='inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
