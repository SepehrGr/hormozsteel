'use client'

import Link from 'next/link'
import { ShoppingCart, Headphones, ChartNoAxesCombined } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className='py-6'>
      <div className='container px-4 mx-auto'>
        {/* CTA Section */}
        <div className='relative p-14 md:p-20 mb-4 overflow-hidden text-center rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 border border-slate-300/80 dark:border-slate-700/50 shadow-2xl shadow-slate-400/30 dark:shadow-slate-900/50'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-70 dark:opacity-[0.07]'>
            <div className='absolute top-0 left-0 w-72 h-72 -translate-x-36 -translate-y-36 bg-blue-400/30 dark:bg-blue-500 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 right-0 w-72 h-72 translate-x-36 translate-y-36 bg-cyan-500/25 dark:bg-cyan-600 rounded-full blur-3xl'></div>
            <div className='absolute top-1/2 right-1/2 w-64 h-64 translate-x-1/2 -translate-y-1/2 bg-slate-500/10 dark:bg-white/10 rounded-full blur-3xl'></div>
          </div>

          {/* Subtle grid overlays for light/dark themes */}
          <div
            className='absolute inset-0 opacity-[0.08] dark:hidden'
            style={{
              backgroundImage:
                'linear-gradient(rgba(15,23,42,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.55) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
          <div
            className='absolute inset-0 hidden opacity-[0.03] dark:block'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          <div className='absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-slate-900/5 dark:from-white/5 dark:to-black/20'></div>

          {/* Content */}
          <div className='relative z-10'>
            <h3 className='mb-3 text-4xl font-bold text-slate-950 dark:text-white md:text-5xl tracking-tight'>
              آماده شروع همکاری هستید؟
            </h3>
            <p className='max-w-2xl mx-auto mb-10 text-lg text-slate-700 dark:text-slate-300 md:text-xl'>
              با آهن هرمز، خرید محصولات فولادی را با اطمینان و به بهترین قیمت
              تجربه کنید
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Link
                href='/products'
                className='inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/50 hover:shadow-blue-700/50 hover:-translate-y-0.5'
              >
                <ShoppingCart className='w-5 h-5 ml-2' />
                مشاهده محصولات
              </Link>
              <Link
                href='/moment-news'
                className='inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-600/60 hover:bg-slate-950 dark:hover:bg-slate-700/60 hover:text-white dark:hover:text-white hover:border-slate-950 dark:hover:border-slate-500 shadow-sm shadow-slate-400/20 dark:shadow-none'
              >
                <ChartNoAxesCombined className='w-5 h-5 ml-2' />
                قیمت لحظه ای
              </Link>
              <Link
                href='/contact'
                className='inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-600/60 hover:bg-slate-950 dark:hover:bg-slate-700/60 hover:text-white dark:hover:text-white hover:border-slate-950 dark:hover:border-slate-500 shadow-sm shadow-slate-400/20 dark:shadow-none'
              >
                <Headphones className='w-5 h-5 ml-2' />
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
