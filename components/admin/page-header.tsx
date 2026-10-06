import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** Eyebrow + title + blurb, with page-level actions on the right. */
export function PageHeader({
  eyebrow,
  title,
  icon: Icon,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  icon: LucideIcon
  description: string
  actions?: ReactNode
}) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div>
        <p className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
          {eyebrow}
        </p>
        <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground'>
          <Icon aria-hidden className='h-6 w-6' />
          {title}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
      </div>
      {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
    </div>
  )
}
