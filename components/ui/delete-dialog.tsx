// Browser code without 'use client': only client components render it.
import type { ReactNode } from 'react'
import type { ActionResult } from '@/lib/actions'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

import { useCloseDialog } from '@/components/ui/dialog-scope'
import { ConfirmDialog } from '@/components/ui/dialogs'
import { toastResult } from '@/lib/action-toast'
import { capitalize } from '@/lib/format'

/**
 * Confirm, then delete one row. Mount only while open.
 *
 * ```tsx
 * <DeleteDialog noun='category' name={row.name}
 *   action={() => deleteCategory({ id: row.id })}>
 *   optional warning
 * </DeleteDialog>
 * ```
 */
export function DeleteDialog({
  noun,
  name,
  action,
  blocked,
  children,
}: {
  /** Lowercase, as in "Delete category". */
  noun: string
  /** The row's name, shown in the question. */
  name: string
  /** A call to the delete Server Action. */
  action: () => Promise<ActionResult>
  /** Disables Delete and drops the question; `children` says why. */
  blocked?: boolean
  /** A warning, shown in an amber box. */
  children?: ReactNode
}) {
  const close = useCloseDialog()
  const [pending, startTransition] = useTransition()

  const confirm = () =>
    startTransition(async () => {
      const result = await action()

      if (toastResult(result, `${capitalize(noun)} deleted`)) close()
    })

  return (
    <ConfirmDialog
      confirmDisabled={blocked}
      confirmIcon={<Trash2 aria-hidden className='h-4 w-4' />}
      pending={pending}
      title={`Delete ${noun}`}
      onClose={close}
      onConfirm={confirm}
    >
      {blocked ? null : (
        <p>
          Delete <span className='font-medium text-foreground'>{name}</span>?
          This can&apos;t be undone.
        </p>
      )}
      {children ? (
        <p className='border border-amber-600/30 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'>
          {children}
        </p>
      ) : null}
    </ConfirmDialog>
  )
}
