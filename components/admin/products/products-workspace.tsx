'use client'

import type {
  BulkUpdateData,
  CategoryOption,
  MillOption,
} from '@/components/admin/products/types'
import type { ProductDTO } from '@/types/products'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDisclosure } from '@heroui/modal'

import { deleteProducts, updateProduct } from '@/app/admin/products/actions'
import {
  BulkDeleteModal,
  BulkUpdateModal,
} from '@/components/admin/products/modals'
import {
  ProductFormDialog,
  toProductFormValues,
} from '@/components/admin/products/product-form-dialog'
import ProductsTable from '@/components/admin/products/products-table'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { useProductMutations } from '@/hooks/use-product-mutations'

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
  const router = useRouter()
  const { bulkUpdate, bulkDelete } = useProductMutations(router.refresh)

  const [checkedIds, setCheckedIds] = useState<string[]>([])
  // Only rows still on the page count, so a deleted row drops out of the selection
  const selectedIds = checkedIds.filter(id => products.some(p => p.id === id))
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({})
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const [deleting, setDeleting] = useState<ProductDTO | null>(null)
  const bulkModal = useDisclosure()
  const bulkDeleteModal = useDisclosure()

  const handleBulkUpdate = async () => {
    if (await bulkUpdate(selectedIds, bulkUpdateData)) {
      setCheckedIds([])
      setBulkUpdateData({})
      bulkModal.onClose()
    }
  }

  const handleBulkDelete = async () => {
    if (await bulkDelete(selectedIds)) {
      setCheckedIds([])
      bulkDeleteModal.onClose()
    }
  }

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
            <button
              className='border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={bulkModal.onOpen}
            >
              Edit selected
            </button>
            <button
              className='border border-red-600/40 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 transition-colors duration-200 ease-out hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200'
              type='button'
              onClick={bulkDeleteModal.onOpen}
            >
              Delete selected
            </button>
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

      <BulkUpdateModal
        bulkUpdateData={bulkUpdateData}
        categories={categories}
        isOpen={bulkModal.isOpen}
        selectedCount={selectedIds.length}
        setBulkUpdateData={setBulkUpdateData}
        onOpenChange={bulkModal.onOpenChange}
        onUpdate={handleBulkUpdate}
      />
      <BulkDeleteModal
        isOpen={bulkDeleteModal.isOpen}
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onOpenChange={bulkDeleteModal.onOpenChange}
      />
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
