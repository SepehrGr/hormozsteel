'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PRODUCT_CATEGORIES, PRODUCT_ROUTES } from '@/types/products'
import { ArrowLeft } from 'lucide-react'

export default function ProductsPage() {
  // آیکون‌های مناسب برای هر دسته محصول
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: string } = {
      rebar: 'icon-milgerd',
      profile: 'icon-profil',
      sheet: 'icon-varagh',
      angle: 'icon-Corners',
      beam: 'icon-girder',
      pipe: 'icon-pipe',
      wire: 'icon-wire',
      mesh: 'icon-grating',
      shamsh: 'icon-bullion',
    }
    return iconMap[categoryId] || 'icon-Equipment'
  }

  return (
    <div className='w-full'>
      {/* Header Section */}
      <div className='relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5'></div>

        <div className='container relative px-6 py-16 mx-auto'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30'>
              <i className='text-3xl text-white icon-warehouse drop-shadow-lg'></i>
            </div>
            <h1 className='mb-6 text-5xl font-bold text-white drop-shadow-2xl'>
              محصولات آهن هرمز
            </h1>
            <p className='max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg'>
              مجموعه کاملی از محصولات فولادی با کیفیت برتر، قیمت مناسب و تضمین
              اصالت
            </p>
            <div className='flex items-center justify-center gap-6 mt-8 text-sm'>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <i className='text-white icon-Check-mark drop-shadow-md'></i>
                <span className='font-medium text-white drop-shadow-sm'>
                  بیش از ۱۵ سال تجربه
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <i className='text-white icon-star drop-shadow-md'></i>
                <span className='font-medium text-white drop-shadow-sm'>
                  کیفیت تضمینی
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <i className='text-white icon-CAR drop-shadow-md'></i>
                <span className='font-medium text-white drop-shadow-sm'>
                  تحویل سریع
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Categories Section */}
      <div className='container px-6 py-16 mx-auto'>
        {/* Category Cards Grid */}
        <div className='grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-3'>
          {PRODUCT_CATEGORIES.map(category => (
            <Link
              key={category.id}
              href={`/products/${category.id}`}
              className='block group'
            >
              <div className='relative h-64 overflow-hidden transition-all duration-500 border shadow-lg bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-gray-200/50 dark:border-gray-700/50 rounded-3xl backdrop-blur-sm hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.01] '>
                {/* Gradient Overlay */}
                <div className='absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 group-hover:opacity-100'></div>

                {/* Content */}
                <div className='relative z-10 flex flex-col justify-between h-full p-6'>
                  {/* Top Section with Icon */}
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center justify-center w-20 h-20 transition-all duration-500 border-2 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl border-white/50 dark:border-gray-700/50 group-hover:scale-102 group-hover:shadow-2xl'>
                      <i
                        className={`text-4xl text-white drop-shadow-lg ${getCategoryIcon(category.id)}`}
                      ></i>
                    </div>

                    {/* Badge */}
                    <div className='px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700/50 shadow-sm'>
                      {category.subcategories.length} زیرمجموعه
                    </div>
                  </div>

                  {/* Bottom Section with Title and Action */}
                  <div className='space-y-3'>
                    <h3 className='text-2xl font-bold text-gray-900 transition-all duration-300 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                      {category.name}
                    </h3>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50'>
                      <span className='text-sm font-semibold text-blue-600 transition-all duration-300 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'>
                        مشاهده محصولات
                      </span>
                      <div className='flex items-center justify-center w-10 h-10 transition-all duration-300 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:translate-x-1'>
                        <ArrowLeft className='w-5 h-5 text-blue-600 transition-all duration-300 dark:text-blue-400 group-hover:text-white' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className='absolute inset-0 transition-all duration-500 opacity-0 rounded-3xl group-hover:opacity-100 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-400/20 blur-xl -z-10'></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className='relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='absolute top-0 left-0 rounded-full w-72 h-72 bg-white/5 -translate-y-36 -translate-x-36'></div>
        <div className='absolute bottom-0 right-0 translate-x-48 translate-y-48 rounded-full w-96 h-96 bg-white/5'></div>

        <div className='container relative px-6 py-16 mx-auto text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/10 backdrop-blur-sm'>
            <i className='text-2xl text-white icon-Support'></i>
          </div>

          <h2 className='mb-4 text-3xl font-bold'>نیاز به مشاوره دارید؟</h2>
          <p className='max-w-2xl mx-auto mb-8 text-lg opacity-90'>
            کارشناسان مجرب ما آماده ارائه مشاوره رایگان و انتخاب بهترین محصول
            برای پروژه شما هستند
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link href='/contact'>
              <Button
                size='lg'
                className='px-8 py-3 text-lg font-bold text-blue-700 transition-all duration-300 bg-white shadow-lg hover:bg-blue-50 hover:shadow-xl group'
              >
                <i className='ml-3 transition-transform icon-phone-call-3 group-hover:scale-110'></i>
                تماس با کارشناس
              </Button>
            </Link>
          </div>

          <div className='flex items-center justify-center gap-6 mt-8 text-sm opacity-80'>
            <div className='flex items-center gap-2'>
              <i className='text-lg icon-the-watch'></i>
              <span>پاسخگویی 24 ساعته</span>
            </div>
            <div className='flex items-center gap-2'>
              <i className='text-lg icon-Check-mark'></i>
              <span>مشاوره رایگان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
