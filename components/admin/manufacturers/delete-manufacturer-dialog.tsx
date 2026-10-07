// Browser code without 'use client': only client components render it.
import type { ManufacturerRow } from '@/components/admin/manufacturers/manufacturers-table'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

import { deleteManufacturer } from '@/app/admin/manufacturers/actions'
import { useCloseDialog } from '@/components/ui/dialog-scope'
import { ConfirmDialog } from '@/components/ui/dialogs'
import { toastResult } from '@/lib/action-toast'
import { pluralize } from '@/lib/format'

/** Confirm, then delete one manufacturer. Mount only while open. */
export function DeleteManufacturerDialog({
  manufacturer,
}: {
  manufacturer: ManufacturerRow
}) {
  const close = useCloseDialog()
  const [pending, startTransition] = useTransition()
  const products = manufacturer._count.products

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteManufacturer({ id: manufacturer.id })

      if (toastResult(result, 'Manufacturer deleted')) close()
    })

  return (
    <ConfirmDialog
      confirmIcon={<Trash2 aria-hidden className='h-4 w-4' />}
      pending={pending}
      title='Delete manufacturer'
      onClose={close}
      onConfirm={confirm}
    >
      <p>
        Delete{' '}
        <span className='font-medium text-foreground'>{manufacturer.name}</span>
        ? This can&apos;t be undone.
      </p>
      {products > 0 ? (
        // Not a blocker like categories: the products stay, only unlinked.
        <p className='border border-amber-600/30 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'>
          {pluralize(products, 'product')} will lose their mill. They stay in
          the catalog with no manufacturer.
        </p>
      ) : null}
    </ConfirmDialog>
  )
}
