'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import { siteConfig } from '@/config/site'
import HeroItem from './hero-item'
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Threads from '../ui/threads'

/** Site amber accents as 0–1 RGB (Threads / OGL Color). */
const AMBER_LIGHT: [number, number, number] = [
  146 / 255, // amber-800 #92400e — matches light-mode codes
  64 / 255,
  14 / 255,
]
const AMBER_DARK: [number, number, number] = [
  245 / 255, // amber-500 #f59e0b — matches dark-mode codes
  158 / 255,
  11 / 255,
]

export default function Hero() {
  const swiperRef = useRef<SwiperType | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const threadsColor = useMemo((): [number, number, number] => {
    if (!mounted) return AMBER_LIGHT
    return resolvedTheme === 'dark' ? AMBER_DARK : AMBER_LIGHT
  }, [mounted, resolvedTheme])

  const sessionLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date())
    } catch {
      return new Date().toLocaleString('en-US')
    }
  }, [])

  useEffect(() => {
    const onResize = () => swiperRef.current?.update()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section className='w-full'>
      {/* Hero */}
      <div className='relative overflow-hidden border-b border-border bg-background'>
        <div
          className='hidden md:block pointer-events-none absolute inset-0 opacity-70 dark:opacity-50'
          aria-hidden
        >
          <Threads
            color={threadsColor}
            distance={0.6}
            amplitude={2}
            enableMouseInteraction={false}
          />
        </div>

        <div className='relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20'>
          {/* Session strip */}
          <div className='mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4 text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-2 font-medium text-foreground'>
              <span className='relative flex h-2 w-2' aria-hidden>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/40 opacity-60' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500' />
              </span>
              Market open
            </span>
            <span className='hidden h-3 w-px bg-border sm:block' aria-hidden />
            <span className='font-mono tabular-nums'>{sessionLabel}</span>
            <span className='hidden h-3 w-px bg-border sm:block' aria-hidden />
            <span>
              Quotes in <span className='font-medium text-foreground'>USD</span>{' '}
              · ex-works basis
            </span>
          </div>

          <div className='grid items-end gap-10 lg:grid-cols-12 lg:gap-8'>
            <div className='lg:col-span-7'>
              <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                Steel &amp; long products
              </p>
              <h1 className='max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]'>
                Transparent mill prices for serious procurement
              </h1>
              <p className='mt-5 max-w-xl text-base leading-relaxed text-muted-foreground'>
                Track unit rates across rebar, HRC and CRC sheet, structural
                sections, pipe, and billets. Filter by size and mill, export
                what you need, and request a firm quote from sales.
              </p>

              <div className='mt-8 flex flex-wrap items-center gap-3'>
                <Link
                  href='/products'
                  className='inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:opacity-90'
                >
                  Browse catalog
                  <ArrowRight className='h-4 w-4' />
                </Link>
                <Link
                  href='/contact'
                  className='inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                >
                  Request a quote
                </Link>
              </div>
            </div>

            {/* Snapshot panel — real-site market summary */}
            <aside className='lg:col-span-5'>
              <div className='border border-border bg-card'>
                <div className='flex items-center justify-between border-b border-border px-4 py-3'>
                  <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                    Board snapshot
                  </h2>
                  <span className='text-xs text-muted-foreground'>
                    Indicative
                  </span>
                </div>
                <ul className='divide-y divide-border'>
                  {[
                    {
                      code: 'REBAR',
                      name: 'Ribbed rebar',
                      note: 'A3 · 8–32 mm',
                      href: '/products/rebar',
                    },
                    {
                      code: 'HRC',
                      name: 'Hot-rolled sheet',
                      note: '2–10 mm coil / plate',
                      href: '/products/sheet/hot-rolled',
                    },
                    {
                      code: 'SECT',
                      name: 'Structural beams',
                      note: 'IPE · HEA · HEB',
                      href: '/products/beam',
                    },
                    {
                      code: 'PIPE',
                      name: 'Seamed & seamless',
                      note: 'ERW / seamless',
                      href: '/products/pipe',
                    },
                  ].map(row => (
                    <li key={row.code}>
                      <Link
                        href={row.href}
                        className='group flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 ease-out hover:bg-muted'
                      >
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='font-mono text-[10px] font-medium tracking-wider text-amber-800 dark:text-amber-500'>
                              {row.code}
                            </span>
                            <span className='truncate text-sm font-medium text-foreground'>
                              {row.name}
                            </span>
                          </div>
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {row.note}
                          </p>
                        </div>
                        <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-foreground' />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className='border-t border-border bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground'>
                  Full boards open from the product index below.
                </div>
              </div>
            </aside>
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
                href='/products'
                className='text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
              >
                Full catalog
              </Link>
              <div className='flex items-center border border-border bg-card'>
                <button
                  type='button'
                  aria-label='Previous product families'
                  className='category-nav-prev flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <span className='h-4 w-px bg-border' aria-hidden />
                <button
                  type='button'
                  aria-label='Next product families'
                  className='category-nav-next flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
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
                  label={item.label}
                  icon={item.icon}
                  categoryId={item.name}
                  lineCount={item.items?.length}
                />
              ))}
            </div>

            <div className='hidden md:block'>
              <Swiper
                modules={[Navigation]}
                spaceBetween={1}
                slidesPerView={3}
                loop={siteConfig.heroItems.length > 5}
                onSwiper={s => {
                  swiperRef.current = s
                }}
                navigation={{
                  nextEl: '.category-nav-next',
                  prevEl: '.category-nav-prev',
                }}
                breakpoints={{
                  768: { slidesPerView: 3, spaceBetween: 1 },
                  1024: { slidesPerView: 4, spaceBetween: 1 },
                  1280: { slidesPerView: 5, spaceBetween: 1 },
                }}
                className='category-index-swiper !bg-border'
              >
                {siteConfig.heroItems.map(item => (
                  <SwiperSlide key={item.name} className='!h-auto bg-card'>
                    <HeroItem
                      label={item.label}
                      icon={item.icon}
                      categoryId={item.name}
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
