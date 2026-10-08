import type { ReactNode } from 'react'

import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Hover highlight for a body row. */
export const rowClass =
  'transition-colors duration-200 ease-out hover:bg-muted/40'

export interface Column {
  label: ReactNode
  /** Width or alignment, e.g. `text-right`. */
  className?: string
}

/**
 * Scrollable admin table: header row from `columns`, body rows as children.
 *
 * ```tsx
 * <AdminTable columns={[{ label: 'Name' }, { label: 'Total', className: 'text-right' }]}>
 *   {rows.map(row => <tr key={row.id} className={rowClass}>…</tr>)}
 * </AdminTable>
 * ```
 */
export function AdminTable({
  columns,
  className = 'min-w-[720px]',
  children,
}: {
  columns: Column[]
  /** Sets when it starts scrolling sideways. */
  className?: string
  children: ReactNode
}) {
  return (
    <div className='overflow-x-auto'>
      <table className={cn('w-full text-sm', className)}>
        <thead>
          <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
            {columns.map((column, index) => (
              <th key={index} className={cn('px-4 py-2.5', column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>{children}</tbody>
      </table>
    </div>
  )
}

/** First cell of a row: a 36px media box, the name, and a one-line description. */
export function NameCell({
  media,
  name,
  description,
}: {
  media: ReactNode
  name: string
  description?: string | null
}) {
  return (
    <div className='flex items-center gap-3'>
      <span className='flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/50 text-muted-foreground'>
        {media}
      </span>
      <div className='min-w-0'>
        <p className='font-medium text-foreground'>{name}</p>
        {description ? (
          <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Edit and Delete icon buttons for the row named `name`; no `onDelete`, no Delete. */
export function RowActions({
  name,
  onEdit,
  onDelete,
}: {
  name: string
  onEdit: () => void
  onDelete?: () => void
}) {
  return (
    <div className='flex justify-end gap-1'>
      <Button
        aria-label={`Edit ${name}`}
        size='icon'
        variant='outline'
        onClick={onEdit}
      >
        <Pencil aria-hidden className='h-3.5 w-3.5' />
      </Button>
      {onDelete ? (
        <Button
          aria-label={`Delete ${name}`}
          size='icon'
          variant='danger-outline'
          onClick={onDelete}
        >
          <Trash2 aria-hidden className='h-3.5 w-3.5' />
        </Button>
      ) : null}
    </div>
  )
}
