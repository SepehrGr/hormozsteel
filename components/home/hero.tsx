'use client'

import type { Swiper as SwiperType } from 'swiper'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import Threads from '../ui/threads'

import HeroItem from './hero-item'

import { siteConfig } from '@/config/site'

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
          aria-hidden
          className='hidden md:block pointer-events-none absolute inset-0 opacity-70 dark:opacity-50'
        >
          <Threads
            amplitude={2}
            color={threadsColor}
            distance={0.6}
            enableMouseInteraction={false}
          />
        </div>

        <div className='relative mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-16 lg:py-20'>
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
                  className='inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 ease-out hover:opacity-90'
                  href='/products'
                >
                  Browse catalog
                  <ArrowRight className='h-4 w-4' />
                </Link>
                <Link
                  className='inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                  href='/contact'
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
                        className='group flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 ease-out hover:bg-muted'
                        href={row.href}
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
