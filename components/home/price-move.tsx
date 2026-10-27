import type { PriceDirection } from '@prisma/client'

import { ArrowDown, ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/format'

export default function PriceMove({
  delta,
  direction,
}: {
  delta: number | null
  direction: PriceDirection
}) {
  if (!delta || direction === 'STABLE')
    return <span className='text-sm text-muted-foreground'>No change</span>

  const Arrow = direction === 'UP' ? ArrowUp : ArrowDown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-medium tabular-nums',
        direction === 'UP'
          ? 'text-emerald-700 dark:text-emerald-400'
          : 'text-red-700 dark:text-red-400',
      )}
    >
      <Arrow aria-hidden className='h-3.5 w-3.5' />
      <span className='sr-only'>{direction === 'UP' ? 'Up' : 'Down'}</span>
      {formatUsd(Math.abs(delta))}
    </span>
  )
}
