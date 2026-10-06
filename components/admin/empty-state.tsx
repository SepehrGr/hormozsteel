import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** Centered placeholder for an empty table or list. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className='px-4 py-16 text-center'>
      <Icon
        aria-hidden
        className='mx-auto mb-3 h-10 w-10 text-muted-foreground'
      />
      <p className='text-sm font-medium text-foreground'>{title}</p>
      {description ? (
        <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
      ) : null}
      {action ? <div className='mt-4'>{action}</div> : null}
    </div>
  )
}
