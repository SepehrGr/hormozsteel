'use client'

import type { Swiper as SwiperType } from 'swiper'
import type { LatestPrice } from '@/lib/data/prices'

import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'

import ProductCard from '@/components/products/product-card'

export default function ProductSlider({
  products,
}: {
  products: LatestPrice[]
}) {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const onResize = () => swiperRef.current?.update()

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className='w-full border-b border-border bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-15'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
            Latest prices
          </h2>
          <div className='flex shrink-0 items-center gap-2'>
            <div className='flex items-center border border-border bg-card'>
              <button
                aria-label='Previous prices'
                className='prices-nav-prev flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                type='button'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <span aria-hidden className='h-4 w-px bg-border' />
              <button
                aria-label='Next prices'
                className='prices-nav-next flex h-8 w-8 items-center justify-center text-foreground transition-colors duration-200 ease-out hover:bg-muted cursor-pointer'
                type='button'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className='border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground'>
            No recent price moves yet.
          </div>
        ) : (
          <div className='overflow-hidden border border-border bg-border shadow-sm dark:shadow-none'>
            {/* Mobile: stacked 1-col board cells */}
            <div className='grid grid-cols-1 gap-px sm:grid-cols-2 md:hidden'>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className='hidden md:block'>
              <Swiper
                breakpoints={{
                  768: { slidesPerView: 3, spaceBetween: 1 },
                  1024: { slidesPerView: 4, spaceBetween: 1 },
                  1280: { slidesPerView: 5, spaceBetween: 1 },
                }}
                className='prices-board-swiper !bg-border'
                loop={products.length > 4}
                modules={[Navigation]}
                navigation={{
                  nextEl: '.prices-nav-next',
                  prevEl: '.prices-nav-prev',
                }}
                slidesPerView={3}
                spaceBetween={1}
                onSwiper={s => {
                  swiperRef.current = s
                }}
              >
                {products.map(product => (
                  <SwiperSlide key={product.id} className='!h-auto bg-card'>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
