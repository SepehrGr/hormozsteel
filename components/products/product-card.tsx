import type { LatestPrice } from '@/lib/data/prices'

import Link from 'next/link'

import { productCategoryHref, subcategorySlug } from '@/types/products'
import { formatUsd } from '@/lib/format'

/**
 * Price tick cell — market-board style for the latest-prices rail.
 */
export default function ProductCard({ product }: { product: LatestPrice }) {
  const move =
    product.direction === 'UP'
      ? 'up'
      : product.direction === 'DOWN'
        ? 'down'
        : 'flat'
  const { categorySlug, subcategory: sub, delta, updated } = product
  const hasDelta = delta != null && delta !== 0
  const href =
    categorySlug && sub
      ? `${productCategoryHref(categorySlug)}/${subcategorySlug(sub)}`
      : categorySlug
        ? productCategoryHref(categorySlug)
        : '/products'

  const moveClass =
    move === 'up'
      ? 'text-emerald-700 dark:text-emerald-400'
      : move === 'down'
        ? 'text-red-700 dark:text-red-400'
        : 'text-muted-foreground'

  const meta = [product.brand, product.subcategory].filter(Boolean).join(' · ')

  return (
    <Link
      className='group flex h-full min-h-[12.5rem] flex-col bg-card px-5 py-5 text-left transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[13.5rem] sm:px-6 sm:py-6'
      href={href}
    >
      {/* 1. Identity */}
      <div className='min-w-0'>
        <h3 className='line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]'>
          {product.name}
        </h3>
        {meta ? (
          <p className='mt-1.5 truncate text-xs leading-relaxed text-muted-foreground'>
            {meta}
          </p>
        ) : null}
      </div>

      {/* 2. Price — primary data */}
      <div className='mt-auto pt-6'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <p className='mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
              Unit price
            </p>
            <p className='font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]'>
              {product.price > 0 ? formatUsd(product.price) : 'Quote'}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              per {product.unit.toLowerCase()}
            </p>
          </div>

          {/* 3. Move — secondary signal */}
          <div className={`shrink-0 flex items-center gap-1 ${moveClass}`}>
            {hasDelta ? (
              <p className='mt-1 font-mono text-sm font-medium tabular-nums'>
                {move === 'down' ? '−' : '+'}
                {formatUsd(Math.abs(delta))}
              </p>
            ) : (
              <p className='mt-1 text-xs text-muted-foreground'>No change</p>
            )}
          </div>
        </div>

        {/* 4. Timestamp — quiet footer */}
        <div className='mt-4 border-t border-border pt-3 text-left text-[11px] text-muted-foreground'>
          {updated ? (
            <p className=' tabular-nums'>
              <span className='font-mono mr-1'>Updated</span>
              <span className='font-mono'>{updated}</span>{' '}
            </p>
          ) : (
            '—'
          )}
        </div>
      </div>
    </Link>
  )
}
