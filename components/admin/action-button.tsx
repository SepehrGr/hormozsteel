'use client'

import type { ReactNode } from 'react'
import type { ActionResult } from '@/lib/actions'

import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { toastResult } from '@/lib/action-toast'

/**
 * An icon button that runs a Server Action in one click, no confirm step, and
 * toasts the result. A server table passes the action bound to the row:
 *
 * ```tsx
 * <ActionButton label='Mark read' success='Marked read'
 *   action={updateContactStatus.bind(null, { id, status: 'READ' })}>
 *   <MailOpen aria-hidden className='h-3.5 w-3.5' />
 * </ActionButton>
 * ```
 */
export function ActionButton({
  label,
  success,
  action,
  children,
}: {
  /** Accessible name; the button shows only its icon. */
  label: string
  /** Toast text on success. */
  success: string
  action: () => Promise<ActionResult>
  /** The icon. */
  children: ReactNode
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      aria-label={label}
      disabled={pending}
      size='icon'
      variant='outline'
      onClick={() =>
        startTransition(async () => {
          toastResult(await action(), success)
        })
      }
    >
      {children}
    </Button>
  )
}
