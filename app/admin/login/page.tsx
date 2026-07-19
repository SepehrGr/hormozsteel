'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { EyeOff, Eye, Lock, AlertCircle, ArrowLeft } from 'lucide-react'

const fieldClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

/** Map NextAuth / custom authorize() errors to user-facing English copy. */
function getLoginErrorMessage(
  rawError?: string | null,
  minutes?: string | null,
): string {
  if (!rawError) {
    return 'Authentication failed. Please try again.'
  }

  const minutesLabel = minutes && minutes !== '' ? minutes : '15'

  if (rawError === 'RateLimitExceeded' || rawError.includes('RateLimitExceeded')) {
    return `Too many login attempts. Please wait ${minutesLabel} minutes and try again.`
  }

  const lockedMatch = rawError.match(/AccountLocked(?::(\d+))?/)
  if (rawError === 'AccountLocked' || lockedMatch) {
    const mins = lockedMatch?.[1] || minutesLabel
    return `Account temporarily locked after too many failed attempts. Try again in ${mins} minutes.`
  }

  if (rawError === 'CredentialsSignin') {
    return 'Invalid email or password.'
  }

  if (rawError.includes('USER_INACTIVE')) {
    return 'This account is inactive. Contact a super admin.'
  }

  if (rawError.includes('USER_NOT_FOUND')) {
    return 'No account found for this email.'
  }

  if (rawError.includes('WRONG_PASSWORD')) {
    return 'Incorrect password.'
  }

  if (rawError.includes('INVALID_CREDENTIALS')) {
    return 'Invalid email or password.'
  }

  if (rawError === 'AccessDenied') {
    return 'Access denied. You do not have permission to sign in.'
  }

  if (rawError === 'Configuration') {
    return 'Authentication is misconfigured. Contact the site owner.'
  }

  // Avoid dumping raw stack-like strings into the UI
  if (rawError.length > 120 || rawError.includes('\n')) {
    return 'Authentication failed. Please try again.'
  }

  return rawError
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [checkingSession, setCheckingSession] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  const applyUrlError = useCallback(() => {
    const authError = searchParams.get('error')
    const minutes = searchParams.get('minutes')
    if (authError) {
      setError(getLoginErrorMessage(authError, minutes))
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    getSession()
      .then(session => {
        if (cancelled) return
        if (session?.user) {
          router.replace('/admin/dashboard')
          return
        }
        applyUrlError()
        setCheckingSession(false)
      })
      .catch(() => {
        if (cancelled) return
        applyUrlError()
        setCheckingSession(false)
      })

    return () => {
      cancelled = true
    }
  }, [router, applyUrlError])

  const validate = () => {
    const next: { email?: string; password?: string } = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      next.email = 'Email is required.'
    } else if (!isValidEmail(trimmedEmail)) {
      next.email = 'Enter a valid email address.'
    }

    if (!password) {
      next.password = 'Password is required.'
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (!result) {
        setError('No response from the authentication service. Please try again.')
        return
      }

      if (result.error) {
        const errorFromUrl = searchParams.get('error')
        const minutesFromUrl = searchParams.get('minutes')

        if (
          result.error.includes('AccountLocked') ||
          errorFromUrl === 'AccountLocked'
        ) {
          const match = result.error.match(/AccountLocked:(\d+)/)
          const minutes = match?.[1] || minutesFromUrl || '15'
          setError(getLoginErrorMessage(`AccountLocked:${minutes}`, minutes))
        } else if (
          result.error.includes('RateLimitExceeded') ||
          errorFromUrl === 'RateLimitExceeded'
        ) {
          setError(getLoginErrorMessage('RateLimitExceeded', minutesFromUrl || '15'))
        } else {
          setError(getLoginErrorMessage(result.error, minutesFromUrl))
        }
        return
      }

      if (result.ok) {
        // Full navigation so middleware / session cookie are applied
        window.location.href = '/admin/dashboard'
        return
      }

      setError('Sign-in could not be completed. Please try again.')
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground' />
          <p className='text-sm text-muted-foreground'>Checking session…</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background' dir='ltr'>
      {/* Top strip */}
      <div className='border-b border-border'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back to site
          </Link>
          <span className='font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
            Hormoz Steel · Admin
          </span>
        </div>
      </div>

      <div className='flex flex-1 items-center justify-center px-4 py-12 md:py-16'>
        <div className='w-full max-w-md'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border bg-card'>
              <Lock className='h-5 w-5 text-foreground' aria-hidden />
            </div>
            <p className='mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
              Restricted access
            </p>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
              Admin sign-in
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              Enter your credentials to open the catalog control panel.
            </p>
          </div>

          {/* Board form */}
          <div className='border border-border bg-card'>
            <div className='flex items-center justify-between border-b border-border px-5 py-3'>
              <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Credentials
              </h2>
              <span className='text-xs text-muted-foreground'>* Required</span>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5 px-5 py-6' noValidate>
              <div>
                <label htmlFor='admin-email' className={labelClass}>
                  Email *
                </label>
                <input
                  id='admin-email'
                  type='email'
                  autoComplete='email'
                  inputMode='email'
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: undefined }))
                    }
                    if (error) setError('')
                  }}
                  disabled={isLoading}
                  className={`${fieldClass} ${
                    fieldErrors.email
                      ? 'border-red-600/60 focus:border-red-600 focus:ring-red-600'
                      : ''
                  }`}
                  placeholder='admin@hormozsteel.demo'
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'admin-email-error' : undefined
                  }
                />
                {fieldErrors.email ? (
                  <p
                    id='admin-email-error'
                    className='mt-1.5 text-xs text-red-600 dark:text-red-400'
                    role='alert'
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor='admin-password' className={labelClass}>
                  Password *
                </label>
                <div className='relative'>
                  <input
                    id='admin-password'
                    type={isVisible ? 'text' : 'password'}
                    autoComplete='current-password'
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({
                          ...prev,
                          password: undefined,
                        }))
                      }
                      if (error) setError('')
                    }}
                    disabled={isLoading}
                    className={`${fieldClass} pr-11 ${
                      fieldErrors.password
                        ? 'border-red-600/60 focus:border-red-600 focus:ring-red-600'
                        : ''
                    }`}
                    placeholder='••••••••'
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? 'admin-password-error' : undefined
                    }
                  />
                  <button
                    type='button'
                    onClick={() => setIsVisible(v => !v)}
                    disabled={isLoading}
                    className='absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground disabled:opacity-50'
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                  >
                    {isVisible ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p
                    id='admin-password-error'
                    className='mt-1.5 text-xs text-red-600 dark:text-red-400'
                    role='alert'
                  >
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {error ? (
                <div
                  role='alert'
                  className='flex items-start gap-2.5 border border-red-600/40 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-100'
                >
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                  <p>{error}</p>
                </div>
              ) : null}

              <div className='border-t border-border pt-5'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='inline-flex w-full items-center justify-center bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isLoading ? (
                    <span className='inline-flex items-center gap-2'>
                      <span className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground' />
                      Signing in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className='mt-6 text-center text-xs text-muted-foreground'>
            Demo admin:{' '}
            <span className='font-mono text-foreground'>admin@hormozsteel.demo</span>{' '}
            · <span className='font-mono text-foreground'>admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-background'>
          <div className='text-center'>
            <div className='mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground' />
            <p className='text-sm text-muted-foreground'>Loading…</p>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
