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

import {
  BulkDeleteModal,
  BulkUpdateModal,
  DeleteSingleModal,
  EditProductModal,
} from '@/components/admin/products/modals'
import ProductsTable from '@/components/admin/products/products-table'
import {
  emptyProductForm,
  isFormValid,
  toProductPayload,
} from '@/components/admin/products/types'
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
  const { bulkUpdate, bulkDelete, updateProduct, deleteProduct } =
    useProductMutations(router.refresh)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({})
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null)
  const [editProductData, setEditProductData] = useState(emptyProductForm)
  const [productToDelete, setProductToDelete] = useState<ProductDTO | null>(
    null,
  )
  const bulkModal = useDisclosure()
  const bulkDeleteModal = useDisclosure()
  const editModal = useDisclosure()
  const deleteModal = useDisclosure()

  const handleBulkUpdate = async () => {
    if (await bulkUpdate(selectedIds, bulkUpdateData)) {
      setSelectedIds([])
      setBulkUpdateData({})
      bulkModal.onClose()
    }
  }

  const handleBulkDelete = async () => {
    if (await bulkDelete(selectedIds)) {
      setSelectedIds([])
      bulkDeleteModal.onClose()
    }
  }

  const handleEditProduct = (product: ProductDTO) => {
    setEditingProduct(product)
    setEditProductData({
      name: product.name,
      brand: product.brand || '',
      manufacturerId: product.manufacturerId || '',
      size: product.size || '',
      price: product.price,
      inStock: product.inStock,
      categoryId: product.categoryId,
      subcategory: product.subcategory || '',
      weight: product.weightKg ?? undefined,
    })
    editModal.onOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !isFormValid(editProductData)) return

    if (
      await updateProduct(editingProduct.id, toProductPayload(editProductData))
    ) {
      setEditingProduct(null)
      editModal.onClose()
    }
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    const deletedId = productToDelete.id

    if (await deleteProduct(deletedId)) {
      setSelectedIds(prev => prev.filter(id => id !== deletedId))
      setProductToDelete(null)
      deleteModal.onClose()
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
        onDelete={product => {
          setProductToDelete(product)
          deleteModal.onOpen()
        }}
        onEdit={handleEditProduct}
        onSelect={(id, checked) =>
          setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(other => other !== id),
          )
        }
        onSelectAll={checked =>
          setSelectedIds(checked ? products.map(p => p.id) : [])
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
      <EditProductModal
        categories={categories}
        editProductData={editProductData}
        editingProduct={editingProduct}
        isOpen={editModal.isOpen}
        manufacturers={manufacturers}
        setEditProductData={setEditProductData}
        onOpenChange={editModal.onOpenChange}
        onSave={handleSaveEdit}
      />
      <DeleteSingleModal
        isOpen={deleteModal.isOpen}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onOpenChange={deleteModal.onOpenChange}
      />
    </>
  )
}
