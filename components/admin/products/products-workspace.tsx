'use client'

import type {
  CategoryOption,
  MillOption,
} from '@/components/admin/products/types'
import type { ProductDTO } from '@/types/products'

import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'

import {
  deleteProducts,
  updateProduct,
} from '@/app/admin/(panel)/products/actions'
import { BulkEditDialog } from '@/components/admin/products/bulk-edit-dialog'
import { ProductFormDialog } from '@/components/admin/products/product-form-dialog'
import ProductsTable from '@/components/admin/products/products-table'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { pluralize } from '@/lib/format'
import { toProductFormValues } from '@/lib/schemas/product'

/** The page's products with selection, row edits and the bulk/edit/delete dialogs. */
export function ProductsWorkspace({
  products,
  categories,
  manufacturers,
  sort,
  dir,
}: {
  products: ProductDTO[]
  categories: CategoryOption[]
  manufacturers: MillOption[]
  sort: string
  dir: 'asc' | 'desc'
}) {
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  // Only rows still on the page count, so a deleted row drops out of the selection
  const selectedIds = checkedIds.filter(id => products.some(p => p.id === id))
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const [deleting, setDeleting] = useState<ProductDTO | null>(null)
  const [bulk, setBulk] = useState<'edit' | 'delete' | null>(null)

  return (
    <>
      {/* Below sm the bulk bar is a dock pinned to the screen bottom; from sm up it sticks under the header */}
      <div className='flex flex-col'>
        {selectedIds.length > 0 ? (
          <div className='sticky z-20 max-sm:pointer-events-none max-sm:bottom-0 sm:top-14 sm:bg-card max-sm:order-last max-sm:p-3 max-sm:transition-transform max-sm:duration-300 max-sm:ease-out max-sm:starting:translate-y-full motion-reduce:transition-none'>
            <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-sm max-sm:pointer-events-auto max-sm:justify-start max-sm:border max-sm:border-foreground/15 max-sm:bg-card max-sm:p-2 max-sm:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.7)] max-sm:dark:bg-muted'>
              <Button
                aria-label='Unselect all'
                className='h-11 w-11 sm:hidden'
                size='icon'
                title='Unselect all'
                variant='outline'
                onClick={() => setCheckedIds([])}
              >
                <X aria-hidden className='h-4 w-4' />
              </Button>
              <p
                aria-live='polite'
                className='flex items-baseline gap-1.5 text-muted-foreground'
              >
                <span className='font-medium tabular-nums text-foreground max-sm:font-mono max-sm:text-base max-sm:font-semibold'>
                  {selectedIds.length}
                </span>
                selected
              </p>
              <div className='flex gap-2 max-sm:grid max-sm:basis-full max-sm:grid-cols-2 max-sm:*:h-11 max-sm:*:px-3'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setBulk('edit')}
                >
                  <Pencil aria-hidden className='h-3.5 w-3.5' />
                  Edit selected
                </Button>
                <Button
                  size='sm'
                  variant='danger-outline'
                  onClick={() => setBulk('delete')}
                >
                  <Trash2 aria-hidden className='h-3.5 w-3.5' />
                  Delete selected
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <ProductsTable
          dir={dir}
          products={products}
          selectedIds={selectedIds}
          sort={sort}
          onDelete={setDeleting}
          onEdit={setEditing}
          onSelect={(id, checked) =>
            setCheckedIds(prev =>
              checked ? [...prev, id] : prev.filter(other => other !== id),
            )
          }
          onSelectAll={checked =>
            setCheckedIds(checked ? products.map(p => p.id) : [])
          }
        />
      </div>

      {bulk ? (
        <DialogScope onClose={() => setBulk(null)}>
          {bulk === 'edit' ? (
            <BulkEditDialog categories={categories} ids={selectedIds} />
          ) : (
            <DeleteDialog
              action={() => deleteProducts({ ids: selectedIds })}
              count={selectedIds.length}
              name={pluralize(selectedIds.length, 'selected product')}
              noun='product'
            >
              Their price history is deleted too.
            </DeleteDialog>
          )}
        </DialogScope>
      ) : null}
      {editing ? (
        <DialogScope onClose={() => setEditing(null)}>
          <ProductFormDialog
            action={values => updateProduct({ id: editing.id, values })}
            categories={categories}
            defaultValues={toProductFormValues(editing)}
            manufacturers={manufacturers}
            mode='edit'
          />
        </DialogScope>
      ) : null}
      {deleting ? (
        <DialogScope onClose={() => setDeleting(null)}>
          <DeleteDialog
            action={() => deleteProducts({ ids: [deleting.id] })}
            name={deleting.name}
            noun='product'
          >
            Its price history is deleted too.
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}
