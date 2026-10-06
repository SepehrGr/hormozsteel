import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Bordered admin section with a mono uppercase heading bar. */
export function DataCard({
  title,
  icon: Icon,
  actions,
  className,
  children,
}: {
  title: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
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
