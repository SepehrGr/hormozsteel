import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/** Bordered admin section with a mono uppercase heading bar. */
export function DataCard({
  title,
  titleHidden = false,
  icon: Icon,
  actions,
  className,
  children,
}: {
  title: ReactNode
  /** Drops the bar but keeps the heading for screen readers, e.g. above a table. */
  titleHidden?: boolean
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  if (titleHidden) {
    return (
      <section className={cn('border border-border bg-card', className)}>
        <h2 className='sr-only'>{title}</h2>
        {children}
      </section>
    )
  }

  return (
    <section className={cn('border border-border bg-card', className)}>
      <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
        {Icon ? (
          <Icon aria-hidden className='h-4 w-4 text-muted-foreground' />
        ) : null}
        <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
          {title}
        </h2>
        {actions ? <div className='ml-auto flex gap-2'>{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

/** A quiet "go to the full list" link for a card's `actions`. */
export function DataCardLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
      href={href}
    >
      {children}
      <ArrowRight aria-hidden className='h-3 w-3' />
    </Link>
  )
}
