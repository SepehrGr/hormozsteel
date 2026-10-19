'use client'

import type { QuickOrderStatus } from '@prisma/client'

import { useOptimistic, useTransition } from 'react'

import { updateQuickOrderStatus } from '@/app/admin/orders/actions'
import { Select } from '@/components/ui/field'
import { QUICK_ORDER_STATUSES, statusLabel } from '@/config/order-status'
import { toastResult } from '@/lib/action-toast'

/**
 * A quote request's status as a select that saves on change. The new value
 * shows at once and falls back to the saved one if the save fails.
 */
export function QuickOrderStatusSelect({
  id,
  name,
  status,
}: {
  id: string
  /** The customer's name, for the accessible label. */
  name: string
  status: QuickOrderStatus
}) {
  const [shown, setShown] = useOptimistic(status)
  const [pending, startTransition] = useTransition()

  const change = (next: QuickOrderStatus) =>
    startTransition(async () => {
      setShown(next)
      toastResult(
        await updateQuickOrderStatus({ id, status: next }),
        `${name}'s request marked ${statusLabel(next).toLowerCase()}`,
      )
    })

  return (
    <Select
      aria-label={`Status of ${name}'s request`}
      className='w-36 py-1.5 text-xs pointer-coarse:h-11'
      disabled={pending}
      value={shown}
      onChange={e => change(e.target.value as QuickOrderStatus)}
    >
      {QUICK_ORDER_STATUSES.map(s => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </Select>
  )
}
