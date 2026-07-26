'use client'

import Link from 'next/link'
import { useCategories } from '@/hooks/use-api'
import { resolveCategoryIcon } from '@/config/category-icons'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function ProductsPage() {
  const { categories } = useCategories()

  return (
    <div className='w-full'>
      {/* Page header — matches About / Contact editorial strip */}
      <header className='border-b border-border'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
          <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
            Catalog
          </p>
          <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-7'>
              <h1 className='max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                Product index
              </h1>
              <p className='mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                Unit prices across rebar, beams, sheet, pipe, profiles, and
                related lines. Open a board to filter by size and mill, then
                request a firm quote from sales.
              </p>
            </div>
            <dl className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:col-span-5'>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Families
                </dt>
                <dd className='mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground'>
                  {categories.length}
                </dd>
              </div>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Quote basis
                </dt>
                <dd className='mt-0.5 text-sm font-medium text-foreground'>
                  USD · ex-works
                </dd>
              </div>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Currency
                </dt>
                <dd className='mt-0.5 text-sm font-medium text-foreground'>
                  USD
                </dd>
              </div>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Desk
                </dt>
                <dd className='mt-0.5 text-sm font-medium text-foreground'>
                  Next business day
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* Category board */}
      <section className='border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
          <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Product families
              </h2>
              <p className='mt-2 text-lg font-semibold tracking-tight text-foreground'>
                Open a pricing board
              </p>
            </div>
            <Link
              href='/contact'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
            >
              Request a quote
              <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>

          <div className='grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map(category => {
              const iconClass = resolveCategoryIcon(
                category.icon ?? category.slug,
              )
              const code = category.slug.toUpperCase()
              return (
                <Link
                  key={category.id}
                  href={`/products/${category.slug}`}
                  className='group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden bg-card px-5 py-5 transition-colors duration-200 ease-out hover:bg-muted border border-border'
                >
                  <i
                    className={`${iconClass} pointer-events-none absolute -right-1 bottom-1 text-[4.5rem] leading-none text-foreground/10 transition-colors duration-200 ease-out group-hover:text-foreground/15`}
                    aria-hidden
                  />
                  <div className='relative z-[1] flex items-start justify-between gap-2'>
                    <span className='font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500'>
                      {code}
                    </span>
                    <span className='text-[10px] tabular-nums text-muted-foreground'>
                      {category.subcategories.length} sub-lines
                    </span>
                  </div>
                  <div className='relative z-[1] mt-auto'>
                    <h3 className='text-base font-semibold tracking-tight text-foreground sm:text-lg'>
                      {category.name}
                    </h3>
                    <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                      {category.description}
                    </p>
                    <span className='mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-out group-hover:text-foreground'>
                      Open board
                      <ChevronRight className='h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5' />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className='border-b border-border bg-muted/40'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-14'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
              Need help shortlisting sizes?
            </h2>
            <p className='mt-2 max-w-lg text-sm text-muted-foreground'>
              Share tonnage, grade, and delivery city — sales will reply with a
              firm quote against the catalog board.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            >
              Contact sales
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href='/weight/rebar'
              className='inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              Weight calculators
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
