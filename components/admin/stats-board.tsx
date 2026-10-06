import type { LucideIcon } from 'lucide-react'

import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface Stat {
  label: string
  /** Numbers are grouped (`1,234`); strings render as-is (e.g. `$12k`, `—`). */
  value: number | string
  icon?: LucideIcon
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
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className='bg-card px-4 py-4'>
          <div className='flex items-start justify-between gap-2'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              {label}
            </dt>
            {Icon ? (
              <Icon aria-hidden className='h-4 w-4 text-muted-foreground' />
            ) : null}
          </div>
          <dd className='mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground'>
            {typeof value === 'number' ? formatNumber(value) : value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
