import type { LatestPrice } from '@/lib/data/prices'
import type { PriceIndexRow } from '@/lib/data/catalog'

import HeroDrawings from './hero-drawings'
import LatestMoveCard from './latest-move-card'
import PriceSearch from './price-search'

export default function Hero({
  moves,
  index,
}: {
  moves: LatestPrice[]
  index: PriceIndexRow[]
}) {
  return (
    <section className='border-b border-border bg-background'>
      <div className='mx-auto grid max-w-7xl items-center gap-10 px-4 pt-[clamp(28px,5vh,64px)] pb-[clamp(56px,10vh,120px)] md:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14'>
        <div className='text-center lg:text-left'>
          <h1 className='text-[clamp(2.7rem,5.6vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.045em] text-balance text-foreground'>
            Steel prices you can{' '}
            <span className='text-amber-800 dark:text-amber-500'>
              plan a job on
            </span>
          </h1>
          <p className='mx-auto mt-[22px] max-w-[44ch] text-[clamp(1.05rem,1.3vw,1.2rem)] lg:mx-0 leading-relaxed text-muted-foreground'>
            Today&apos;s unit rates for rebar, sheet, beams, and pipe from five
            mills. Find your size, weigh the order, and get a firm quote.
          </p>
          <PriceSearch index={index} />
        </div>

        <div className='relative mx-auto w-full max-w-sm lg:aspect-square lg:max-w-none'>
          <HeroDrawings />
          {moves.length > 0 && <LatestMoveCard moves={moves} />}
        </div>
      </div>
    </section>
  )
}
