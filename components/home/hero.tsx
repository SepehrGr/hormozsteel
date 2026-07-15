'use client'

import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { siteConfig } from '@/config/site'
import HeroItem from './hero-item'
import { ChevronRight, ChevronLeft } from 'lucide-react'

export default function Hero() {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        swiperRef.current.update()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className='relative w-full overflow-hidden'>
      <div className='relative border-b border-border bg-background'>
        <div className='relative z-10 px-4 pb-10 pt-14 text-center md:pt-16'>
          <div className='mx-auto max-w-3xl'>
            <p className='mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase'>
              B2B steel catalog
            </p>
            <h1 className='mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]'>
              Daily steel prices,
              <span className='mt-1 block text-muted-foreground'>
                clear and ready to quote
              </span>
            </h1>
            <p className='mx-auto max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg'>
              Browse rebar, beams, sheets, profiles, and more. Built as an
              English portfolio demo of a real B2B pricing product.
            </p>
          </div>
        </div>
      </div>

      <div className='w-full pb-8 pt-8'>
        <div className='mx-auto mb-6 flex items-center justify-between px-4'>
          <h2 className='text-lg font-semibold tracking-tight text-foreground'>
            Product categories
          </h2>
          <div className='hidden items-center gap-2 md:flex'>
            <button
              type='button'
              aria-label='Previous categories'
              className='swiper-button-prev-custom flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <button
              type='button'
              aria-label='Next categories'
              className='swiper-button-next-custom flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='relative px-4'>
          <div className='grid grid-cols-2 gap-4 md:hidden'>
            {siteConfig.heroItems.map(item => (
              <div key={item.name} className='flex justify-center'>
                <HeroItem
                  label={item.label}
                  icon={item.icon}
                  categoryId={item.name}
                />
              </div>
            ))}
          </div>

          <div className='hidden md:block'>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={3}
              loop={true}
              onSwiper={swiper => {
                swiperRef.current = swiper
              }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
                1536: { slidesPerView: 6 },
              }}
              className='hero-swiper'
            >
              {siteConfig.heroItems.map(item => (
                <SwiperSlide key={item.name} className='h-auto'>
                  <div className='py-4'>
                    <HeroItem
                      label={item.label}
                      icon={item.icon}
                      categoryId={item.name}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}
