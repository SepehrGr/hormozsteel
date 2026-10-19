import type { LucideIcon } from 'lucide-react'

import Link from 'next/link'

import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface Stat {
  label: string
  /** Numbers are grouped (`1,234`); strings render as-is (e.g. `$12k`, `—`). */
  value: number | string
  icon?: LucideIcon
  /** A short line under the value, e.g. `4 out of stock`. */
  detail?: string
  /** Makes the whole tile a link, e.g. to the matching filtered list. */
  href?: string
}

// Tailwind only ships classes it can see written out in full.
const COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

/** Hairline-separated row of KPI tiles. */
export function StatsBoard({ stats }: { stats: Stat[] }) {
  return (
    <dl
      className={cn(
        'grid gap-px overflow-hidden border border-border bg-border',
        COLUMNS[stats.length] ?? COLUMNS[4],
      )}
    >
      {stats.map(({ label, value, icon: Icon, detail, href }) => (
        <div
          key={label}
          className={cn(
            'group relative bg-card px-4 py-4 max-sm:last:odd:col-span-2',
            href &&
              'transition-colors duration-200 ease-out focus-within:bg-muted hover:bg-muted',
          )}
        >
          <div className='flex items-start justify-between gap-2'>
            <dt className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              {href ? (
                // The ::after stretches the link over the whole tile
                <Link
                  className='after:absolute after:inset-0 focus-visible:outline-none'
                  href={href}
                >
                  {label}
                </Link>
              ) : (
                label
              )}
            </dt>
            {Icon ? (
              <Icon
                aria-hidden
                className={cn(
                  'h-4 w-4 text-muted-foreground',
                  href &&
                    'transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500',
                )}
              />
            ) : null}
          </div>
          <dd className='mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground'>
            {typeof value === 'number' ? formatNumber(value) : value}
          </dd>
          {detail ? (
            <dd className='mt-1 text-xs text-muted-foreground'>{detail}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}
