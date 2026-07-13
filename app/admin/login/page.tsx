'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { EyeOff, Eye, Lock, AlertCircle } from 'lucide-react'

function getLoginErrorMessage(rawError?: string | null) {
  if (!rawError) return 'احراز هویت ناموفق. لطفاً دوباره تلاش کنید.'

  // NextAuth / Credentials common values
  if (rawError === 'CredentialsSignin') return 'ایمیل یا رمز عبور نادرست است'

  // Custom server error codes from Credentials authorize()
  if (rawError.includes('USER_INACTIVE')) return 'این کاربر غیرفعال است'
  if (rawError.includes('USER_NOT_FOUND')) return 'کاربری با این ایمیل وجود ندارد'
  if (rawError.includes('WRONG_PASSWORD')) return 'رمز عبور نادرست است'

  // Backwards compatibility: previously everything returned INVALID_CREDENTIALS
  if (rawError.includes('INVALID_CREDENTIALS')) return 'ایمیل یا رمز عبور نادرست است'

  return rawError
}

function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleVisibility = () => setIsVisible(!isVisible)

  useEffect(() => {
    // Check if user is already logged in
    getSession().then(session => {
      if (session?.user) {
        router.push('/admin/dashboard')
      }
    })

    // Check for auth errors in URL
    const authError = searchParams.get('error')
    const minutes = searchParams.get('minutes')
    if (authError && !error) {
      // Only set if error is not already set
      if (authError === 'RateLimitExceeded') {
        setError(
          `تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ${minutes || '15'} دقیقه دیگر دوباره تلاش کنید.`,
        )
      } else if (authError === 'AccountLocked') {
        setError(
          `حساب کاربری به دلیل تلاش‌های ناموفق متعدد به طور موقت قفل شده است. لطفاً ${minutes || '15'} دقیقه دیگر دوباره تلاش کنید.`,
        )
      } else {
        setError(getLoginErrorMessage(authError))
      }
    }
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('لطفاً تمام فیلدها را پر کنید')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Handle different error types
        // Check if error contains account lockout info
        // NextAuth might pass the error through, or we need to check the URL
        const errorFromUrl = searchParams.get('error')

        // Check if error is AccountLocked
        if (
          result.error.includes('AccountLocked') ||
          errorFromUrl === 'AccountLocked'
        ) {
          // Try to extract minutes from error message or URL
          const match = result.error.match(/AccountLocked:(\d+)/)
          const minutes = match ? match[1] : searchParams.get('minutes') || '15'
          setError(
            `حساب کاربری به دلیل تلاش‌های ناموفق متعدد به طور موقت قفل شده است. لطفاً ${minutes} دقیقه دیگر دوباره تلاش کنید.`,
          )
        } else if (errorFromUrl === 'RateLimitExceeded') {
          // Rate limit error from URL
          const minutes = searchParams.get('minutes') || '15'
          setError(
            `تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ${minutes} دقیقه دیگر دوباره تلاش کنید.`,
          )
        } else {
          setError(getLoginErrorMessage(result.error))
        }
      } else if (result?.ok) {
        // Successful login, redirect to dashboard
        window.location.href = '/admin/dashboard'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('خطایی رخ داده است. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'
      dir='rtl'
    >
      <Card className='w-full max-w-md'>
        <CardHeader className='flex flex-col items-center pb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Lock className='w-8 h-8 text-primary' />
            <h1 className='text-2xl font-bold'>پنل مدیریت</h1>
          </div>
          <p className='text-center text-default-500'>
            برای دسترسی به پنل مدیریت وارد شوید
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              type='email'
              label='ایمیل'
              placeholder='ایمیل خود را وارد کنید'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              variant='bordered'
              isDisabled={isLoading}
            />
            <Input
              label='رمز عبور'
              placeholder='رمز عبور خود را وارد کنید'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              variant='bordered'
              isDisabled={isLoading}
              endContent={
                <button
                  className='focus:outline-none'
                  type='button'
                  onClick={toggleVisibility}
                  disabled={isLoading}
                >
                  {isVisible ? (
                    <EyeOff className='w-5 h-5 text-default-400' />
                  ) : (
                    <Eye className='w-5 h-5 text-default-400' />
                  )}
                </button>
              }
              type={isVisible ? 'text' : 'password'}
            />

            {error && (
              <div className='flex items-center gap-2 p-3 text-sm rounded-lg text-danger bg-danger-50'>
                <AlertCircle className='w-4 h-4' />
                {error}
              </div>
            )}

            <Button
              type='submit'
              color='primary'
              className='w-full'
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
          <div className='text-center'>
            <div className='w-8 h-8 mx-auto border-4 rounded-full border-primary border-t-transparent animate-spin' />
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
