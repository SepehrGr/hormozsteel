'use client'

import type { LatestPrice } from '@/lib/data/prices'

import { useEffect, useState } from 'react'

import PriceMove from './price-move'

import { formatUsd } from '@/lib/format'

/** Centred under the hero drawing on narrow screens, in its bottom-left corner from lg; steps through the latest moves. */
export default function LatestMoveCard({ moves }: { moves: LatestPrice[] }) {
  const [at, setAt] = useState(0)
  const move = moves[at % moves.length]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setAt(i => i + 1), 4000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='mx-auto mt-4 w-full max-w-80 overflow-hidden border border-border bg-card px-5 py-4 text-left shadow-lg lg:absolute lg:bottom-0 lg:-left-7 lg:mx-0 lg:mt-0 lg:w-72'>
      <div
        key={at}
        className='animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out'
      >
        <p className='text-xs text-muted-foreground'>
          Latest move · {move.updated}
        </p>
        <p className='mt-0.5 truncate font-semibold text-foreground'>
          {move.name}
        </p>
        <p className='mt-1.5 flex items-baseline gap-2'>
          <span className='text-3xl font-semibold tabular-nums tracking-tight text-foreground'>
            {formatUsd(move.price)}
          </span>
          <span className='text-sm text-muted-foreground'>
            /{move.unit.toLowerCase()}
          </span>
          <PriceMove delta={move.delta} direction={move.direction} />
        </p>
      </div>
    </div>
  )
}
