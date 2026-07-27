'use client'

import Link from 'next/link'
import { Product } from '@/types/products'
import { productCategoryHref, subcategorySlug } from '@/types/products'

interface ProductCardProps {
  product: Product
  onOrder?: (product: Product) => void
  onCalculate?: (product: Product) => void
}

function formatUsd(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function formatTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

type Move = 'up' | 'down' | 'flat'

function resolveMove(product: Product): Move {
  const raw = product.priceHistory?.changeType || product.priceDirection || ''
  const t = String(raw).toLowerCase()

  if (t === 'up' || t === 'increase' || t === 'افزایش') return 'up'
  if (t === 'down' || t === 'decrease' || t === 'کاهش') return 'down'

  return 'flat'
}

/**
 * Price tick cell — market-board style for the latest-prices rail.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const move = resolveMove(product)
  const delta = product.priceHistory?.changeAmount ?? product.priceDelta
  const hasDelta = delta != null && Number(delta) !== 0
  const updated =
    formatTime(product.priceHistory?.changedAt) ||
    formatTime(
      typeof product.priceUpdatedAt === 'string'
        ? product.priceUpdatedAt
        : (product.priceUpdatedAt?.toISOString?.() ?? product.lastUpdated),
    )

  const categorySlug = product.categorySlug || product.category?.slug || ''
  const sub = product.subcategory
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
              per {String(product.unit || 'KG').toLowerCase()}
            </p>
          </div>

          {/* 3. Move — secondary signal */}
          <div className={`shrink-0 flex items-center gap-1 ${moveClass}`}>
            {hasDelta ? (
              <p className='mt-1 font-mono text-sm font-medium tabular-nums'>
                {move === 'down' ? '−' : '+'}
                {formatUsd(Math.abs(Number(delta)))}
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
