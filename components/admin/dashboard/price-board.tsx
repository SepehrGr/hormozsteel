import type { PriceDirection, PriceHistory, ProductUnit } from '@prisma/client'

import { LineChart, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { DataCard, DataCardLink } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import {
  formatDateTime,
  formatNumber,
  formatRelative,
  formatUsd,
} from '@/lib/format'
import { cn } from '@/lib/utils'

type Change = Pick<
  PriceHistory,
  'id' | 'oldPrice' | 'newPrice' | 'direction' | 'changedAt'
> & { product: { name: string; unit: ProductUnit } }

const UNITS: Record<ProductUnit, string> = {
  KG: 'kg',
  TON: 't',
  PIECE: 'pc',
  METER: 'm',
}

// Tailwind only ships classes it can see written out in full.
const MOVES = {
  UP: {
    Icon: TrendingUp,
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-600 dark:bg-emerald-500',
    label: 'Up',
  },
  STABLE: {
    Icon: Minus,
    text: 'text-muted-foreground',
    bar: 'bg-muted-foreground/30',
    label: 'Flat',
  },
  DOWN: {
    Icon: TrendingDown,
    text: 'text-red-700 dark:text-red-400',
    bar: 'bg-red-600 dark:bg-red-500',
    label: 'Down',
  },
} satisfies Record<PriceDirection, unknown>

const ORDER: PriceDirection[] = ['UP', 'STABLE', 'DOWN']

/**
 * How the catalog's prices last moved, as one split bar, then the latest
 * price changes.
 */
export function PriceBoard({
  split,
  changes,
}: {
  /** Products per last price direction. */
  split: Record<PriceDirection, number>
  changes: Change[]
}) {
  const total = split.UP + split.STABLE + split.DOWN

  return (
    <DataCard
      actions={<DataCardLink href='/admin/products'>All products</DataCardLink>}
      icon={LineChart}
      title='Price board'
    >
      {total > 0 ? (
        <div className='border-b border-border px-4 py-4'>
          <div aria-hidden className='flex h-2 gap-px bg-card'>
            {ORDER.map(direction =>
              split[direction] ? (
                <div
                  key={direction}
                  className={MOVES[direction].bar}
                  style={{ flexGrow: split[direction] }}
                />
              ) : null,
            )}
          </div>
          <dl className='mt-3 grid grid-cols-3 gap-2'>
            {ORDER.map(direction => {
              const { Icon, text, label } = MOVES[direction]

              return (
                <div key={direction}>
                  <dt className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                    <Icon aria-hidden className={cn('h-3.5 w-3.5', text)} />
                    {label}
                  </dt>
                  <dd className='mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground'>
                    {split[direction]}
                    <span className='ml-1 text-xs font-normal text-muted-foreground'>
                      {Math.round((split[direction] / total) * 100)}%
                    </span>
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}

      {changes.length === 0 ? (
        <EmptyState
          description='Edit a price on the products page and it shows up here.'
          icon={LineChart}
          title='No price changes yet'
        />
      ) : (
        <ol
          aria-label='Latest price changes'
          className='divide-y divide-border'
        >
          {changes.map(change => {
            const { Icon, text } = MOVES[change.direction]
            const percent = change.oldPrice.isZero()
              ? 0
              : change.newPrice
                  .minus(change.oldPrice)
                  .div(change.oldPrice)
                  .times(100)
                  .toNumber()
            const sign = percent > 0 ? '+' : percent < 0 ? '−' : ''

            return (
              <li
                key={change.id}
                className='flex items-center gap-3 px-4 py-2.5'
              >
                <Icon aria-hidden className={cn('h-4 w-4 shrink-0', text)} />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>
                    {change.product.name}
                  </p>
                  <time
                    className='text-xs text-muted-foreground'
                    dateTime={change.changedAt.toISOString()}
                    title={formatDateTime(change.changedAt)}
                  >
                    {formatRelative(change.changedAt)}
                  </time>
                </div>
                <div className='shrink-0 text-right font-mono tabular-nums'>
                  <p className='text-sm text-foreground'>
                    {formatUsd(change.newPrice.toNumber())}
                    <span className='text-xs text-muted-foreground'>
                      /{UNITS[change.product.unit]}
                    </span>
                  </p>
                  <p className='text-xs'>
                    <span className={text}>
                      {sign}
                      {formatNumber(Math.abs(percent), 1)}%
                    </span>{' '}
                    <span className='text-muted-foreground'>
                      from {formatUsd(change.oldPrice.toNumber())}
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </DataCard>
  )
}
