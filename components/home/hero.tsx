'use client'

import type { Swiper as SwiperType } from 'swiper'

import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import HeroItem from './hero-item'

import { siteConfig } from '@/config/site'

/** Radial rib ticks for the rebar profile, drawn between two radii. */
const ribs = (cx: number, cy: number, ro: number, ri: number, n = 12) =>
  Array.from({ length: n }, (_, k) => {
    const a = (k * 2 * Math.PI) / n

    return (
      `M${(cx + ro * Math.cos(a)).toFixed(1)} ${(cy + ro * Math.sin(a)).toFixed(1)} ` +
      `L${(cx + ri * Math.cos(a)).toFixed(1)} ${(cy + ri * Math.sin(a)).toFixed(1)}`
    )
  }).join(' ')

const CYCLE = 35
/**
 * Five section drawings on a shared 35s cycle, one 7s slot each. All share a
 * 460×420 viewBox so they scale identically. Animation lives in globals.css —
 * note the pathLength="1" contract documented there.
 */
const PROFILES: React.ReactNode[] = [
  <>
    <circle className='hero-ink' cx='230' cy='190' pathLength='1' r='130' />
    <circle className='hero-ink' cx='230' cy='190' pathLength='1' r='108' />
    <path className='hero-ink' d={ribs(230, 190, 130, 108)} pathLength='1' />
    <path
      className='hero-dim'
      d='M100 348 H360 M100 338 V358 M360 338 V358'
      pathLength='1'
    />
    <text className='hero-label' x='196' y='384'>
      d 18
    </text>
    <text className='hero-label' x='176' y='42'>
      REBAR A3
    </text>
  </>,
  <>
    <path
      className='hero-ink'
      d='M120 60 H340 V96 H246 V284 H340 V320 H120 V284 H214 V96 H120 Z'
      pathLength='1'
    />
    <path
      className='hero-dim'
      d='M98 60 V320 M88 60 H108 M88 320 H108'
      pathLength='1'
    />
    <path
      className='hero-dim'
      d='M120 348 H340 M120 338 V358 M340 338 V358'
      pathLength='1'
    />
    <text className='hero-label' x='192' y='384'>
      b 150
    </text>
    <text className='hero-label' x='176' y='42'>
      IPE 300
    </text>
  </>,
  <>
    <ellipse
      className='hero-ink'
      cx='158'
      cy='190'
      pathLength='1'
      rx='44'
      ry='118'
    />
    <ellipse
      className='hero-ink'
      cx='320'
      cy='190'
      pathLength='1'
      rx='44'
      ry='118'
    />
    <path className='hero-ink' d='M158 72 H320 M158 308 H320' pathLength='1' />
    <ellipse
      className='hero-ink'
      cx='158'
      cy='190'
      pathLength='1'
      rx='16'
      ry='46'
    />
    <path
      className='hero-dim'
      d='M158 348 H320 M158 338 V358 M320 338 V358'
      pathLength='1'
    />
    <text className='hero-label' x='196' y='384'>
      w 1250
    </text>
    <text className='hero-label' x='168' y='42'>
      HRC COIL
    </text>
  </>,
  <>
    <circle className='hero-ink' cx='230' cy='190' pathLength='1' r='140' />
    <circle className='hero-ink' cx='230' cy='190' pathLength='1' r='122' />
    <path
      className='hero-dim'
      d='M230 190 H370 M352 180 V200 M230 180 V200'
      pathLength='1'
    />
    <text className='hero-label' x='248' y='178'>
      Ø 355.6
    </text>
    <text className='hero-label' x='248' y='222'>
      r 10.0
    </text>
    <text className='hero-label' x='176' y='36'>
      ERW PIPE
    </text>
  </>,
  <>
    <path
      className='hero-ink'
      d='M130 60 V300 H370 V262 H168 V60 Z'
      pathLength='1'
    />
    <path
      className='hero-dim'
      d='M108 60 V300 M98 60 H118 M98 300 H118'
      pathLength='1'
    />
    <path
      className='hero-dim'
      d='M130 328 H370 M130 318 V338 M370 318 V338'
      pathLength='1'
    />
    <text className='hero-label' x='196' y='364'>
      100 × 100
    </text>
    <text className='hero-label' x='186' y='42'>
      ANGLE L
    </text>
  </>,
]

export default function Hero() {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const onResize = () => swiperRef.current?.update()

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section className='w-full'>
      {/* Hero */}
      <div className='relative flex min-h-[clamp(560px,80vh,820px)] items-center overflow-hidden border-b border-border bg-background'>
        <div aria-hidden className='pointer-events-none absolute inset-0 z-[1]'>
          <div className='hero-stage absolute top-1/2 right-12 hidden aspect-[46/42] w-[40rem] -translate-y-1/2 opacity-30 sm:block lg:opacity-50 xl:opacity-100'>
            {PROFILES.map((profile, i) => (
              <svg
                key={i}
                className='absolute inset-0 h-full w-full overflow-visible'
                preserveAspectRatio='xMidYMid meet'
                // each profile owns a 7s slot of the shared 35s cycle; the
                // strokes inherit --hero-slot as their animation-delay
                style={
                  {
                    '--hero-slot': `${-(CYCLE - (CYCLE / PROFILES.length) * i)}s`,
                  } as React.CSSProperties
                }
                viewBox='0 0 460 420'
              >
                {profile}
              </svg>
            ))}
          </div>
        </div>

        <div className='relative z-[2] mx-auto w-full max-w-7xl px-4 py-20 md:px-6'>
          <div
            aria-hidden
            className='absolute top-10 mb-8 h-0.5 w-18 bg-amber-800 dark:bg-amber-500'
          />
          <h1 className='max-w-[14ch] text-[clamp(2.1rem,5.4vw,4rem)] font-semibold leading-[1.06] tracking-tight text-foreground'>
            Today&apos;s steel prices, all in one place
          </h1>
          <p className='mt-6 max-w-[44ch] text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed text-muted-foreground'>
            Current rates for rebar, sheet, beams, and pipe published openly, so
            you can plan a job without waiting on a callback.
          </p>

          <div className='mt-10 flex flex-wrap items-center gap-3'>
            <Link
              className='inline-flex items-center gap-1.5 bg-primary px-6 py-3 text-[1rem] font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 group'
              href='/products'
            >
              Browse the catalog
              <ArrowRight
                className=' group-hover:translate-x-1 transition'
                size={18}
              />
            </Link>
            <Link
              className='inline-flex items-center gap-2 border border-border px-6 py-3 text-[1rem] font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              href='/contact'
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>

      {/* Product index — keep board design */}
      <div className='border-b border-border bg-muted/30'>
        <div className='mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-15'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div className='flex items-baseline gap-3'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
                Product index
              </h2>
            </div>
            <div className='flex items-center gap-2'>
              <Link
                className='text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
                href='/products'
              >
                Full catalog
              </Link>
              <div className='flex items-center border border-border bg-card'>
                <button
                  aria-label='Previous product families'
                  className='category-nav-prev flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                  type='button'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <span aria-hidden className='h-4 w-px bg-border' />
                <button
                  aria-label='Next product families'
                  className='category-nav-next flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                  type='button'
                >
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          <div className='overflow-hidden border border-border bg-border shadow-sm dark:shadow-none'>
            <div className='grid grid-cols-2 gap-px md:hidden'>
              {siteConfig.heroItems.map(item => (
                <HeroItem
                  key={item.name}
                  categoryId={item.name}
                  icon={item.icon}
                  label={item.label}
                  lineCount={item.items?.length}
                />
              ))}
            </div>

            <div className='hidden md:block'>
              <Swiper
                breakpoints={{
                  768: { slidesPerView: 3, spaceBetween: 1 },
                  1024: { slidesPerView: 4, spaceBetween: 1 },
                  1280: { slidesPerView: 5, spaceBetween: 1 },
                }}
                className='category-index-swiper !bg-border'
                loop={siteConfig.heroItems.length > 5}
                modules={[Navigation]}
                navigation={{
                  nextEl: '.category-nav-next',
                  prevEl: '.category-nav-prev',
                }}
                slidesPerView={3}
                spaceBetween={1}
                onSwiper={s => {
                  swiperRef.current = s
                }}
              >
                {siteConfig.heroItems.map(item => (
                  <SwiperSlide key={item.name} className='!h-auto bg-card'>
                    <HeroItem
                      categoryId={item.name}
                      icon={item.icon}
                      label={item.label}
                      lineCount={item.items?.length}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
