// Browser code without 'use client': only client components render it.
import type { CategoryRow } from '@/components/admin/categories/categories-table'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

import { deleteCategory } from '@/app/admin/categories/actions'
import { useCloseDialog } from '@/components/ui/dialog-scope'
import { ConfirmDialog } from '@/components/ui/dialogs'
import { toastResult } from '@/lib/action-toast'
import { pluralize } from '@/lib/format'

/** Confirm, then delete one category. Mount only while open. */
export function DeleteCategoryDialog({ category }: { category: CategoryRow }) {
  const close = useCloseDialog()
  const [pending, startTransition] = useTransition()
  const products = category._count.products

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteCategory({ id: category.id })

      if (toastResult(result, 'Category deleted')) close()
    })

  return (
    <ConfirmDialog
      // The action refuses too; this count is only as fresh as the page.
      confirmDisabled={products > 0}
      confirmIcon={<Trash2 aria-hidden className='h-4 w-4' />}
      pending={pending}
      title='Delete category'
      onClose={close}
      onConfirm={confirm}
    >
      {products > 0 ? (
        <p className='border border-amber-600/30 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'>
          <span className='font-medium'>{category.name}</span> still has{' '}
          {pluralize(products, 'product')}. Move or delete them first: deleting
          a category deletes every product in it.
        </p>
      ) : (
        <p>
          Delete{' '}
          <span className='font-medium text-foreground'>{category.name}</span>?
          This can&apos;t be undone.
        </p>
      )}
    </ConfirmDialog>
  )
}
