'use client'

import type { ActionResult } from '@/lib/actions'

import { useState } from 'react'

import { RowActions } from '@/components/admin/admin-table'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'

/**
 * A row's Delete button and its confirm dialog, for rows with no Edit. A
 * server table passes the delete action already bound to the row:
 *
 * ```tsx
 * <DeleteRowButton noun='quote request' name={order.customerName}
 *   action={deleteQuickOrder.bind(null, { id: order.id })} />
 * ```
 */
export function DeleteRowButton({
  noun,
  name,
  action,
}: {
  noun: string
  name: string
  action: () => Promise<ActionResult>
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <RowActions name={name} onDelete={() => setOpen(true)} />
      {open ? (
        <DialogScope onClose={() => setOpen(false)}>
          <DeleteDialog action={action} name={name} noun={noun} />
        </DialogScope>
      ) : null}
    </>
  )
}
