'use client'

import { useState } from 'react'
import { Clock, MapPin, Mail, Phone, Instagram } from 'lucide-react'
import Map from '@/components/map'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message,
        })
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: '',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'خطا در ارسال پیام',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <main className='relative'>
      {/* Hero Section */}
      <div className='relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5'></div>

        <div className='relative px-6 py-16 mx-auto max-w-7xl'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30'>
              <Phone className='w-8 h-8 text-white drop-shadow-lg' />
            </div>
            <h1 className='mb-6 text-5xl font-bold text-white drop-shadow-2xl'>
              تماس با آهن هرمز
            </h1>
            <p className='max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg'>
              همکاران ما در بخش پشتیبانی آماده پاسخگویی به شما هستند
            </p>
            <div className='flex items-center justify-center gap-6 mt-8 text-sm'>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <Clock className='w-4 h-4 text-white drop-shadow-md' />
                <span className='font-medium text-white drop-shadow-sm'>
                  پاسخگویی ۲۴ ساعته
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <Phone className='w-4 h-4 text-white drop-shadow-md' />
                <span className='font-medium text-white drop-shadow-sm'>
                  مشاوره رایگان
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20'>
                <MapPin className='w-4 h-4 text-white drop-shadow-md' />
                <span className='font-medium text-white drop-shadow-sm'>
                  بندرعباس
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info & Form Section */}
      <div className='container px-6 py-16 mx-auto'>
        <div className='relative z-20 grid grid-cols-1 gap-12 -mt-24 lg:grid-cols-2'>
          {/* Contact Info Cards */}
          <div className='space-y-6'>
            {/* Hours Card */}
            <div className='relative p-8 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl backdrop-blur-md'>
              <div className='relative flex items-start gap-4'>
                <div className='flex items-center justify-center w-16 h-16 mt-5 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg dark:bg-slate-900 group shrink-0'>
                  <Clock className='w-8 h-8 text-black transition-colors duration-300 dark:text-white' />
                </div>
                <div>
                  <h3 className='mb-3 mr-4 text-xl font-bold text-blue-900 dark:text-blue-100'>
                    ساعات کاری
                  </h3>
                  <div className='space-y-2 font-bold text-gray-900 dark:text-gray-100'>
                    <p className='flex items-center gap-2'>
                      <span className='w-2 h-2 text-gray-900 dark:text-gray-100'></span>
                      شنبه تا چهارشنبه: ۸:۰۰ الی ۱۷:۰۰
                    </p>
                    <p className='flex items-center gap-2'>
                      <span className='w-2 h-2 text-gray-900 dark:text-gray-100'></span>
                      پنجشنبه: ۸:۰۰ الی ۱۲:۰۰
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Phone Card */}
              <div className='relative p-8 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl backdrop-blur-md'>
                <div className='relative flex items-center h-full gap-8'>
                  <div className='flex items-center justify-center w-16 h-16 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg dark:bg-slate-900 hover:border-blue-400 hover:shadow-2xl group shrink-0'>
                    <Phone className='w-8 h-8 text-black transition-colors duration-300 dark:text-white group-hover:text-blue-500' />
                  </div>
                  <div className='w-full'>
                    <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-gray-100'>
                      تلفن تماس
                    </h3>
                    <p className='font-medium text-gray-700 dark:text-gray-200'>
                      09125858047 <br /> 09170282820
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className='relative p-8 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl backdrop-blur-md'>
                <div className='relative flex items-center h-full gap-8'>
                  <div className='flex items-center justify-center w-16 h-16 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg dark:bg-slate-900 hover:border-blue-400 hover:shadow-2xl group shrink-0'>
                    <Instagram className='w-8 h-8 text-black transition-colors duration-300 dark:text-white group-hover:text-blue-500' />
                  </div>
                  <div>
                    <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-gray-100'>
                      اینستاگرام
                    </h3>
                    <p className='font-medium text-gray-700 dark:text-gray-200'>
                      ahanhromoz@
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className='relative p-8 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl backdrop-blur-md'>
              <div className='relative flex items-start gap-4 mb-6'>
                <div className='flex items-center justify-center w-16 h-16 transition-all duration-300 bg-white border-2 border-gray-300 rounded-full shadow-lg dark:bg-slate-900 hover:border-blue-400 hover:shadow-2xl group shrink-0'>
                  <MapPin className='w-8 h-8 text-black transition-colors duration-300 dark:text-white group-hover:text-blue-500' />
                </div>
                <div>
                  <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-gray-100'>
                    آدرس ما
                  </h3>
                  <p className='font-medium text-gray-700 dark:text-gray-200'>
                    بندرعباس، شهرک اندیشه، پشت کتابخانه ایت الله خامنه ای، بالای
                    دفتر پیشخوان، شرکت بازرگانی و ساختمانی بتن پیام هرمز
                  </p>
                </div>
              </div>
              <div className='relative'>
                <Map />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='relative p-8 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl backdrop-blur-md'>
            <div className='relative mb-6 text-center'>
              <div className='inline-flex items-center gap-3 px-4 py-2 mb-4 border rounded-full bg-white/60 dark:bg-slate-800/60 border-gray-200/50 dark:border-gray-700/50'>
                <Mail className='w-5 h-5 text-cyan-600 dark:text-cyan-400' />
                <span className='text-sm font-medium text-cyan-800 dark:text-cyan-200'>
                  فرم تماس
                </span>
              </div>
            </div>

            <form className='space-y-6' onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor='name'
                  className='block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  نام و نام خانوادگی *
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-2 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                />
              </div>
              <div>
                <label
                  htmlFor='phone'
                  className='block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  شماره تماس *
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-2 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  dir='ltr'
                />
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  ایمیل (اختیاری)
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className='w-full px-4 py-2 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                />
              </div>
              <div>
                <label
                  htmlFor='message'
                  className='block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400'
                >
                  پیام شما *
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows={16}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className='w-full px-4 py-2 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                ></textarea>
              </div>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className='w-5 h-5 animate-spin'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    در حال ارسال...
                  </>
                ) : (
                  'ارسال پیام'
                )}
              </button>

              {/* Success/Error Messages - Below Form */}
              {submitStatus.type && (
                <div
                  className={`p-5 rounded-xl border-2 ${
                    submitStatus.type === 'success'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                      : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700'
                  } transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                >
                  <div className='flex items-start gap-3'>
                    {submitStatus.type === 'success' ? (
                      <div className='flex items-center justify-center w-8 h-8 bg-green-500 rounded-full dark:bg-green-600 shrink-0'>
                        <svg
                          className='w-5 h-5 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center w-8 h-8 bg-red-500 rounded-full dark:bg-red-600 shrink-0'>
                        <svg
                          className='w-5 h-5 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </div>
                    )}
                    <div className='flex-1'>
                      <p
                        className={`font-semibold mb-1 ${
                          submitStatus.type === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}
                      >
                        {submitStatus.type === 'success'
                          ? 'موفقیت‌آمیز!'
                          : 'خطا!'}
                      </p>
                      <p
                        className={`text-sm ${
                          submitStatus.type === 'success'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
