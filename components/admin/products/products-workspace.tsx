'use client'

import type {
  CategoryOption,
  MillOption,
} from '@/components/admin/products/types'
import type { ProductDTO } from '@/types/products'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { deleteProducts, updateProduct } from '@/app/admin/products/actions'
import { BulkEditDialog } from '@/components/admin/products/bulk-edit-dialog'
import {
  ProductFormDialog,
  toProductFormValues,
} from '@/components/admin/products/product-form-dialog'
import ProductsTable from '@/components/admin/products/products-table'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { pluralize } from '@/lib/format'

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
      {selectedIds.length > 0 ? (
        <div className='flex items-center justify-between gap-2 border-b border-border px-4 py-2 text-sm'>
          <span className='text-muted-foreground'>
            <span className='font-medium tabular-nums text-foreground'>
              {selectedIds.length}
            </span>{' '}
            selected
          </span>
          <div className='flex gap-2'>
            <Button size='sm' variant='outline' onClick={() => setBulk('edit')}>
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
              Their price history and any order lines that include them are
              deleted too.
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
            Its price history and any order lines that include it are deleted
            too.
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}
