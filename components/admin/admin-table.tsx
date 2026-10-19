import type { ReactNode } from 'react'

import { Pencil, Trash2 } from 'lucide-react'

import { AdminRow } from '@/components/admin/admin-row'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Column<Row> {
  label: ReactNode
  /** The label on narrow screens when `label` isn't plain text, e.g. a sort link. Empty drops it. */
  title?: string
  /** Width or alignment, on the header and the cells, e.g. `text-right`. */
  className?: string
  /** Cells only, e.g. `font-mono text-xs`. */
  cellClassName?: string
  /** The column the rows are sorted by, announced to screen readers. */
  sort?: 'ascending' | 'descending'
  /**
   * Narrow screens: `title` (fills the closed row) and `summary` stay in the
   * closed row; every other cell opens beneath it under its label.
   */
  narrow?: 'title' | 'summary'
  /** Narrow screens keep this header, because it holds a control (select all, sort). */
  narrowHeader?: boolean
  cell: (row: Row) => ReactNode
}

/** The last column: the row's buttons, a full-width bar in an open narrow row. */
export function actionsColumn<Row>(cell: (row: Row) => ReactNode): Column<Row> {
  return { label: 'Actions', title: '', className: 'text-right', cell }
}

/** An open row's cell with its label beside it, from `data-label`. */
const labelledCell =
  'narrow:group-data-[open]/row:grid narrow:grid-cols-[7rem_1fr] narrow:items-baseline narrow:gap-3 narrow:before:text-[11px] narrow:before:font-semibold narrow:before:uppercase narrow:before:tracking-[0.12em] narrow:before:text-muted-foreground narrow:before:content-[attr(data-label)]'

function cellClass<Row>(column: Column<Row>, labelled: boolean) {
  return cn(
    'px-4 py-3 narrow:p-0',
    column.className,
    column.cellClassName,
    column.narrow === 'title' && 'narrow:min-w-0 narrow:flex-1',
    column.narrow === 'summary' && 'narrow:shrink-0',
    !column.narrow &&
      'narrow:order-2 narrow:hidden narrow:basis-full narrow:text-left',
    !column.narrow &&
      (labelled ? labelledCell : 'narrow:group-data-[open]/row:block'),
  )
}

/**
 * Admin table drawn from `columns`. When its box is narrower than the columns
 * need, every row becomes an accordion: `title` and `summary` cells in the
 * closed row, the rest opening beneath it. `detail` adds a toggle column on
 * wide screens too, opening a full-width row.
 *
 * ```tsx
 * <AdminTable
 *   columns={[{ label: 'Name', narrow: 'title', cell: c => c.name }]}
 *   rowLabel={c => `Details of ${c.name}`}
 *   rows={categories}
 * />
 * ```
 */
export function AdminTable<Row extends { id: string }>({
  columns,
  rows,
  rowLabel,
  detail,
  rowClassName,
  wide = false,
}: {
  columns: Column<Row>[]
  rows: Row[]
  /** Accessible name of each row's toggle. */
  rowLabel: (row: Row) => string
  detail?: (row: Row) => ReactNode
  rowClassName?: (row: Row) => string | false
  /** Columns need 60rem instead of 45rem before rows turn into an accordion. */
  wide?: boolean
}) {
  const expands = Boolean(detail)
  const keepsHeader = columns.some(column => column.narrowHeader)
  const colSpan = columns.length + (expands ? 1 : 0)

  return (
    <div
      className='@container/admin-table relative overflow-x-auto'
      data-wide={wide || undefined}
    >
      <table className='w-full text-sm narrow:block'>
        <thead className={keepsHeader ? 'narrow:block' : 'narrow:hidden'}>
          {/* Narrow: lines up with the closed rows, leaving the toggle's width on the right */}
          <tr className='border-b border-border bg-muted/50 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground narrow:flex narrow:items-center narrow:gap-x-3 narrow:py-2.5 narrow:pl-4 narrow:pr-[3.75rem] narrow:pointer-coarse:pr-[4.5rem]'>
            {expands ? (
              <th className='w-12 px-4 py-2.5 narrow:hidden'>
                <span className='sr-only'>Expand</span>
              </th>
            ) : null}
            {columns.map((column, index) => (
              <th
                key={index}
                aria-sort={column.sort}
                className={cn(
                  'px-4 py-2.5 narrow:p-0',
                  column.className,
                  column.narrow === 'title' && 'narrow:flex-1',
                  !column.narrowHeader && 'narrow:hidden',
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-border narrow:block'>
          {rows.map(row => (
            <AdminRow
              key={row.id}
              className={rowClassName?.(row) || undefined}
              colSpan={colSpan}
              detail={detail?.(row)}
              expands={expands}
              label={rowLabel(row)}
            >
              {columns.map((column, index) => {
                const label =
                  column.title ??
                  (typeof column.label === 'string' ? column.label : undefined)

                return (
                  <td
                    key={index}
                    className={cellClass(column, Boolean(label))}
                    data-label={label}
                  >
                    {column.cell(row)}
                  </td>
                )
              })}
            </AdminRow>
          ))}
        </tbody>
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

/**
 * Edit and Delete icon buttons for the row named `name`; a button whose
 * handler is missing isn't shown. `children` are extra buttons, placed first.
 * On narrow screens they fill the row at 44px and Edit and Delete show their text.
 */
export function RowActions({
  name,
  onEdit,
  onDelete,
  children,
}: {
  name: string
  onEdit?: () => void
  onDelete?: () => void
  children?: ReactNode
}) {
  return (
    <div className='flex justify-end gap-1 narrow:gap-2 narrow:*:h-11 narrow:*:w-auto narrow:*:flex-1'>
      {children}
      {onEdit ? (
        <Button
          aria-label={`Edit ${name}`}
          size='icon'
          variant='outline'
          onClick={onEdit}
        >
          <Pencil aria-hidden className='h-3.5 w-3.5' />
          <span aria-hidden className='hidden narrow:inline'>
            Edit
          </span>
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          aria-label={`Delete ${name}`}
          size='icon'
          variant='danger-outline'
          onClick={onDelete}
        >
          <Trash2 aria-hidden className='h-3.5 w-3.5' />
          <span aria-hidden className='hidden narrow:inline'>
            Delete
          </span>
        </Button>
      ) : null}
    </div>
  )
}
