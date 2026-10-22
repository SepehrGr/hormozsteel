import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DataCard } from '@/components/admin/data-card'
import { LoginForm } from '@/components/admin/login-form'
import { getAuthSession } from '@/lib/admin-auth'
import { loginErrorMessage } from '@/lib/login-errors'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[]
    callbackUrl?: string | string[]
  }>
}) {
  const { error, callbackUrl } = await searchParams
  // A path on this site only: not `//evil.com`, `/\evil.com`, or this page
  const next =
    typeof callbackUrl === 'string' &&
    /^\/(?![/\\])/.test(callbackUrl) &&
    !callbackUrl.startsWith('/admin/login')
      ? callbackUrl
      : '/admin/dashboard'

  if (await getAuthSession()) redirect(next)

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='border-b border-border'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6'>
          <Link
            className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground'
            href='/'
          >
            <ArrowLeft aria-hidden className='h-3.5 w-3.5' />
            Back to site
          </Link>
          <span className='font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
            Hormoz Steel · Admin
          </span>
        </div>
      </div>

      <main className='flex flex-1 items-center justify-center px-4 py-12 md:py-16'>
        <div className='w-full max-w-md'>
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-border bg-card'>
              <Lock aria-hidden className='h-5 w-5 text-foreground' />
            </div>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
              Admin sign-in
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              Enter your credentials to open the catalog control panel.
            </p>
          </div>

          <DataCard
            actions={
              <span className='text-xs text-muted-foreground'>* Required</span>
            }
            title='Credentials'
          >
            <LoginForm
              callbackUrl={next}
              urlError={
                typeof error === 'string' ? loginErrorMessage(error) : undefined
              }
            />
          </DataCard>

          <p className='mt-6 text-center text-xs text-muted-foreground'>
            It&apos;s a shared demo: changes reset every hour.
          </p>
        </div>
      </main>
    </div>
  )
}
