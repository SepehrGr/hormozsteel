'use client'

import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { siteConfig } from '@/config/site'
import HeroItem from './heroItem'
import { ChevronRight, ChevronLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GradientText from './ui/gradientText'

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
    <section className='overflow-hidden relative w-full'>
      {/* Enhanced Header Section with Gradient Background */}
      <div className='overflow-hidden relative bg-gradient-to-br to-white from-slate-50 dark:from-slate-900 dark:to-slate-800'>
        {/* Background decorative elements */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br rounded-full translate-x-20 -translate-y-20 from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br rounded-full -translate-x-20 translate-y-20 from-green-100/20 to-blue-100/20 dark:from-green-900/10 dark:to-blue-900/10'></div>

        <div className='relative z-10 px-4 pt-16 pb-12 text-center'>
          <div className='mx-auto max-w-5xl'>
            {/* Enhanced title with gradient text and animation */}
            <h1 className='mb-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl animate-fade-in-up'>
              {/* <span className='block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-600'>
                قیمت روز آهن‌آلات
              </span> */}
              <GradientText
                colors={['#2563eb', '#60a5fa', '#2563eb', '#60a5fa', '#2563eb']}
                animationSpeed={7}
                className='mb-2 font-extrabold'
              >
                قیمت روز آهن‌آلات
              </GradientText>
              <span className='text-slate-900 dark:text-white'>
                خرید مطمئن و سریع
              </span>
            </h1>

            {/* Enhanced description */}
            <p className='mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 animate-fade-in-up'>
              قیمت لحظه‌ای میلگرد، تیرآهن، ورق، پروفیل و سایر محصولات فولادی
              به‌همراه امکان محاسبه وزن و ثبت سفارش آسان.
            </p>

            {/* Action buttons */}
            {/* <div
              className='flex flex-col gap-4 justify-center items-center sm:flex-row sm:gap-6 animate-fade-in-up'
              style={{ animationDelay: '0.4s' }}
            >
              <div className='flex gap-2 items-center w-full max-w-md sm:w-auto'>
                <div className='relative flex-1 sm:w-80'>
                  <Search className='absolute right-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-slate-400' />
                  <Input
                    placeholder='جستجوی محصولات...'
                    className='pr-10 h-12 text-right backdrop-blur-sm transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 hover:bg-white dark:hover:bg-slate-800'
                  />
                </div>
                <Button
                  size='lg'
                  className='px-6 h-12 text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105'
                >
                  جستجو
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Slider Section - Full Width */}
      <div className='pb-8 mt-8 w-full'>
        <div className='px-4 mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-slate-800 dark:text-slate-200'>
              دسته‌بندی محصولات
            </h2>
          </div>
        </div>

        <div className='relative px-4'>
          {/* Mobile Grid - 2 columns */}
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

          {/* Desktop/Tablet Swiper */}
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
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
                1280: {
                  slidesPerView: 5,
                },
                1536: {
                  slidesPerView: 6,
                },
              }}
              className='hero-swiper'
            >
              {siteConfig.heroItems.map(item => (
                <SwiperSlide key={item.name} className='h-auto'>
                  <div className='py-6'>
                    <HeroItem
                      label={item.label}
                      icon={item.icon}
                      categoryId={item.name}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className='hidden md:flex gap-2 absolute top-[-60px] left-0 z-10'>
              <button className='p-2 rounded-md border cursor-pointer swiper-button-prev-custom border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'>
                <ChevronRight className='w-4 h-4' />
              </button>
              <button className='p-2 rounded-md border cursor-pointer swiper-button-next-custom border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'>
                <ChevronLeft className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
