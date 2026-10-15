'use client'

import type { ReactNode } from 'react'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { rowClass } from '@/components/admin/admin-table'
import { Button } from '@/components/ui/button'

/**
 * A table row with a toggle in its first cell that opens `detail` in a
 * full-width row beneath it. No `detail`, no toggle. Pair with `expandColumn`.
 *
 * A server table can render it: the cells and `detail` arrive already rendered,
 * and only the open/closed state lives in the browser.
 */
export function ExpandableRow({
  label,
  colSpan,
  detail,
  children,
}: {
  /** Accessible name of the toggle, e.g. "Sub-lines of Rebar". */
  label: string
  /** The table's column count, so the detail row spans all of it. */
  colSpan: number
  detail?: ReactNode
  /** The row's remaining cells. */
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <tr className={rowClass}>
        <td className='px-2 py-3 text-center'>
          <Button
            aria-expanded={open}
            aria-label={label}
            className='text-muted-foreground disabled:opacity-30'
            disabled={!detail}
            size='icon'
            variant='ghost'
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <ChevronDown aria-hidden className='h-4 w-4' />
            ) : (
              <ChevronRight aria-hidden className='h-4 w-4' />
            )}
          </Button>
        </td>
        {children}
      </tr>
      {open && detail ? (
        <tr className='bg-muted/30'>
          <td className='px-4 py-3 pl-16' colSpan={colSpan}>
            {detail}
          </td>
        </tr>
      ) : null}
    </>
  )
}
