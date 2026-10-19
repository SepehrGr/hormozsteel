'use client'

import type { ReactNode } from 'react'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * One `AdminTable` row and its open state. Open shows `detail` in a full-width
 * row beneath it and, on narrow screens, the cells hidden from the closed row.
 *
 * A server table can render it: the cells and `detail` arrive already rendered,
 * and only the open/closed state lives in the browser.
 */
export function AdminRow({
  label,
  expands,
  detail,
  colSpan,
  className,
  children,
}: {
  /** Accessible name of the toggle, e.g. "Details of Rebar". */
  label: string
  /** The table has a toggle column on wide screens too. */
  expands: boolean
  detail?: ReactNode
  colSpan: number
  className?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const showDetail = open && Boolean(detail)

  return (
    <>
      <tr
        className={cn(
          'group/row transition-colors duration-200 ease-out hover:bg-muted/40',
          'narrow:flex narrow:flex-wrap narrow:items-center narrow:gap-x-3 narrow:gap-y-3 narrow:px-4 narrow:py-3',
          showDetail && 'narrow:border-b-0',
          className,
        )}
        data-open={open || undefined}
      >
        <td
          className={cn(
            'w-12 px-2 py-3 text-center narrow:order-1 narrow:w-auto narrow:p-0',
            !expands && 'hidden narrow:block',
          )}
        >
          <Button
            aria-expanded={open}
            aria-label={label}
            className={cn(
              'aria-expanded:bg-muted pointer-coarse:h-11 pointer-coarse:w-11',
              !detail && 'invisible narrow:visible',
            )}
            size='icon'
            variant='outline'
            onClick={() => setOpen(!open)}
          >
            <ChevronRight
              aria-hidden
              className={cn(
                'h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none',
                open && 'rotate-90',
              )}
            />
          </Button>
        </td>
        {children}
      </tr>
      {showDetail ? (
        <tr className='bg-muted/30 narrow:block'>
          <td
            className='px-4 py-3 pl-16 narrow:block narrow:pb-4 narrow:pl-4'
            colSpan={colSpan}
          >
            {detail}
          </td>
        </tr>
      ) : null}
    </>
  )
}
