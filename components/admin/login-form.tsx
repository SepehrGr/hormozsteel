'use client'

import type { LoginValues } from '@/lib/schemas/user'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormField, Input, invalidProps } from '@/components/ui/field'
import { DEMO_LOGINS } from '@/lib/demo'
import { loginErrorMessage } from '@/lib/login-errors'
import { loginSchema } from '@/lib/schemas/user'

export function LoginForm({
  urlError,
  callbackUrl,
}: {
  /** From `?error=`, shown until the first submit. */
  urlError?: string
  callbackUrl: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema, undefined, { raw: true }),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    }).catch(() => undefined)

    if (result?.ok) {
      // A full load, so the server renders with the new session cookie
      window.location.assign(callbackUrl)

      return
    }
    setError('root', { message: loginErrorMessage(result?.error) })
  })

  const formError = errors.root?.message ?? (isSubmitted ? undefined : urlError)

  return (
    <form noValidate className='space-y-5 px-5 py-6' onSubmit={onSubmit}>
      <div className='space-y-2'>
        <p className='text-xs text-muted-foreground'>Fill in a demo login:</p>
        <div className='grid grid-cols-2 gap-2'>
          {DEMO_LOGINS.map(login => (
            <Button
              key={login.email}
              size='sm'
              variant='outline'
              onClick={() => {
                setValue('email', login.email)
                setValue('password', login.password)
                clearErrors()
              }}
            >
              {login.name}
            </Button>
          ))}
        </div>
      </div>

      <FormField error={errors.email?.message} id='login-email' label='Email *'>
        <Input
          autoComplete='username'
          id='login-email'
          placeholder='admin@hormozsteel.demo'
          type='email'
          {...invalidProps('login-email', errors.email?.message)}
          {...register('email')}
        />
      </FormField>

      <FormField
        error={errors.password?.message}
        id='login-password'
        label='Password *'
      >
        <div className='relative'>
          <Input
            autoComplete='current-password'
            className='pr-11'
            id='login-password'
            type={showPassword ? 'text' : 'password'}
            {...invalidProps('login-password', errors.password?.message)}
            {...register('password')}
          />
          <Button
            aria-label='Show password'
            aria-pressed={showPassword}
            className='absolute right-1 top-1/2 -translate-y-1/2'
            size='icon'
            variant='ghost'
            onClick={() => setShowPassword(shown => !shown)}
          >
            {showPassword ? (
              <EyeOff aria-hidden className='h-4 w-4' />
            ) : (
              <Eye aria-hidden className='h-4 w-4' />
            )}
          </Button>
        </div>
      </FormField>

      {formError ? (
        <div
          className='flex items-start gap-2.5 border border-red-600/40 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-100'
          role='alert'
        >
          <AlertCircle aria-hidden className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{formError}</p>
        </div>
      ) : null}

      <div className='border-t border-border pt-5'>
        <Button
          className='w-full'
          disabled={isSubmitting}
          size='lg'
          type='submit'
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>
    </form>
  )
}
