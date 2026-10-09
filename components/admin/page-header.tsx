import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  icon: Icon,
  description,
  actions,
}: {
  title: string
  icon: LucideIcon
  description: string
  actions?: ReactNode
}) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div>
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
