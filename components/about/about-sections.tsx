import type { ReactNode } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { SteelProfileMark } from '@/components/about/steel-profiles'
import {
  ABOUT_CHAPTERS,
  ABOUT_COVERAGE,
  ABOUT_FACTS,
  ABOUT_HERO,
  ABOUT_YARD,
  ORDER_STEPS,
  QUOTE_FIELDS,
} from '@/config/about'
import { cn } from '@/lib/utils'

/** A full-width bordered band; alternate `muted` ones down the page. */
function Band({ muted, children }: { muted?: boolean; children: ReactNode }) {
  return (
    <section
      className={cn(
        'border-b border-border',
        muted ? 'bg-muted/30' : 'bg-background',
      )}
    >
      <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16'>
        {children}
      </div>
    </section>
  )
}

/** Mono eyebrow + headline that opens a band. */
function SectionIntro({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow: string
  title: string
  className?: string
  /** A lead paragraph under the headline. */
  children?: ReactNode
}) {
  return (
    <div className={className}>
      <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
        {eyebrow}
      </h2>
      <p className='mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
        {title}
      </p>
      {children}
    </div>
  )
}

/** Masthead: the claim, then the port plate with the company datum on its sill. */
export function Masthead() {
  return (
    <header className='border-b border-border bg-background'>
      <div className='mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14'>
        <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
          Company · Hormoz Steel
        </p>

        <div className='mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12'>
          <h1 className='max-w-[15ch] text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-5xl lg:col-span-7 lg:text-[3.5rem]'>
            We bought steel for our own sites before we sold it.
          </h1>
          <p className='max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base lg:col-span-5'>
            Building since 1993, trading mill products since 2019. That order
            matters. It is why we quote the way we wanted to be quoted: spec
            first, then price, then logistics.
          </p>
        </div>

        <figure className='relative mt-10 overflow-hidden border border-border bg-muted md:mt-12'>
          <div className='relative aspect-[3/2] w-full sm:aspect-[2/1] lg:aspect-[21/10]'>
            <Image
              fill
              priority
              alt={ABOUT_HERO.alt}
              blurDataURL={ABOUT_HERO.blur}
              className='object-cover'
              placeholder='blur'
              sizes='(max-width: 1280px) 100vw, 1280px'
              src={ABOUT_HERO.src}
            />
          </div>

          {/* Sill: below the plate on phones, floated on it once there is room */}
          <figcaption className='bg-black/85 sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-transparent'>
            <dl className='grid grid-cols-2 gap-px border-t border-white/25 bg-white/25 sm:grid-cols-4'>
              {ABOUT_FACTS.map(fact => (
                <div key={fact.label} className='bg-black/70 px-4 py-3'>
                  <dt className='font-mono text-[10px] uppercase tracking-[0.16em] text-white/60'>
                    {fact.label}
                  </dt>
                  <dd className='mt-1 text-sm font-medium text-white'>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </figcaption>
        </figure>
      </div>
    </header>
  )
}

/** Track record: the years do the ordering. */
export function TrackRecord() {
  return (
    <Band muted>
      <SectionIntro
        className='mb-8 max-w-2xl'
        eyebrow='Track record'
        title='Two businesses, one discipline'
      />

      <ol className='grid gap-8 border-t border-border sm:grid-cols-3 sm:gap-10'>
        {ABOUT_CHAPTERS.map(chapter => (
          <li key={chapter.year}>
            <span
              aria-hidden
              className='block h-3 w-0.5 bg-amber-800 dark:bg-amber-500'
            />
            <p
              className={cn(
                'mt-5 font-mono text-3xl font-semibold tabular-nums tracking-tight sm:text-[2.5rem]',
                chapter.current
                  ? 'text-foreground'
                  : 'text-amber-800 dark:text-amber-500',
              )}
            >
              {chapter.year}
            </p>
            <h3 className='mt-4 text-base font-semibold tracking-tight text-foreground'>
              {chapter.title}
            </h3>
            <p className='mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground'>
              {chapter.body}
            </p>
          </li>
        ))}
      </ol>
    </Band>
  )
}

/** Coverage: the section chart, then the material itself. */
export function Coverage() {
  return (
    <Band>
      <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <SectionIntro eyebrow='Coverage' title='Sections we quote every day' />
        <Link
          className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
          href='/products'
        >
          Open catalog
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      </div>

      <ul className='grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3'>
        {ABOUT_COVERAGE.map(line => (
          <li key={line.href} className='flex bg-card'>
            <Link
              className='group flex flex-1 items-center gap-5 px-5 py-6 transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground'
              href={line.href}
            >
              <SteelProfileMark
                className='h-14 w-14 shrink-0 text-muted-foreground transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500'
                profile={line.profile}
              />
              <span className='min-w-0'>
                <span className='block text-sm font-medium text-foreground'>
                  {line.name}
                </span>
                <span className='mt-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>
                  {line.spec}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className='mt-px grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3'>
        {ABOUT_YARD.map(plate => (
          <figure key={plate.src} className='bg-card'>
            <div className='relative aspect-[4/3] w-full'>
              <Image
                fill
                alt={plate.alt}
                blurDataURL={plate.blur}
                className='object-cover'
                placeholder='blur'
                sizes='(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 405px'
                src={plate.src}
              />
            </div>
            <figcaption className='border-t border-border px-4 py-3'>
              <span className='block text-sm font-medium text-foreground'>
                {plate.title}
              </span>
              <span className='mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                {plate.spec}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Band>
  )
}

/** Ordering: a real sequence, so it keeps its ordinals. */
export function Ordering() {
  return (
    <Band muted>
      <SectionIntro
        className='mb-6'
        eyebrow='Ordering'
        title='From board to load-out'
      />

      <ol className='grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4'>
        {ORDER_STEPS.map(step => (
          <li key={step.code} className='bg-card px-5 py-5'>
            <div className='flex items-center gap-3'>
              <span className='font-mono text-sm font-semibold tabular-nums text-amber-800 dark:text-amber-500'>
                {step.code}
              </span>
              <span aria-hidden className='h-px flex-1 bg-border' />
            </div>
            <h3 className='mt-4 text-sm font-semibold tracking-tight text-foreground sm:text-base'>
              {step.title}
            </h3>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Band>
  )
}

/** What sales needs: reference fields, not a sequence. */
export function QuoteChecklist() {
  return (
    <Band>
      <div className='grid gap-8 lg:grid-cols-12 lg:gap-12'>
        <SectionIntro
          className='lg:col-span-4'
          eyebrow='Quote request'
          title='What sales needs from you'
        >
          <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
            Clear inputs mean a faster proforma and fewer revisions on grade,
            size, or freight. Send whatever you have — sales will fill the gaps.
          </p>
        </SectionIntro>

        <div className='overflow-hidden border border-border bg-card lg:col-span-8'>
          <div className='flex items-center justify-between border-b border-border px-4 py-3 sm:px-5'>
            <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Line items
            </h3>
            <span className='text-xs text-muted-foreground'>
              {QUOTE_FIELDS.length} fields
            </span>
          </div>
          <dl className='divide-y divide-border'>
            {QUOTE_FIELDS.map(field => (
              <div
                key={field.term}
                className='grid gap-1.5 px-4 py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6 sm:px-5'
              >
                <dt className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground'>
                  {field.term}
                </dt>
                <dd className='text-sm leading-relaxed text-muted-foreground'>
                  {field.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Band>
  )
}
