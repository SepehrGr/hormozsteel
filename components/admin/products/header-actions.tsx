'use client'

import type {
  CategoryOption,
  MillOption,
} from '@/components/admin/products/types'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDisclosure } from '@heroui/modal'
import { addToast } from '@heroui/toast'
import { Upload, Download, Plus } from 'lucide-react'

import { AddProductModal } from '@/components/admin/products/modals'
import {
  emptyProductForm,
  isFormValid,
  toProductPayload,
} from '@/components/admin/products/types'
import { useProductExcel } from '@/hooks/use-product-excel'
import { useProductMutations } from '@/hooks/use-product-mutations'

const secondaryBtn =
  'inline-flex cursor-pointer items-center gap-2 border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'

const primaryBtn =
  'inline-flex cursor-pointer items-center gap-2 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'

/** Add, Excel import and Excel export, which don't depend on the selection. */
export default function HeaderActions({
  categories,
  manufacturers,
}: {
  categories: CategoryOption[]
  manufacturers: MillOption[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fileInputRef, exportProducts, handleFileImport, handleImportClick } =
    useProductExcel()
  const { createProduct } = useProductMutations(router.refresh)
  const addModal = useDisclosure()
  const [newProductData, setNewProductData] = useState(emptyProductForm)

  const handleSaveNewProduct = async () => {
    if (!isFormValid(newProductData)) return

    if (await createProduct(toProductPayload(newProductData))) {
      setNewProductData(emptyProductForm)
      addModal.onClose()
    }
  }

  // Export ignores pagination: the page's filters, one page big enough to hold everything
  const handleExport = async () => {
    const stock = searchParams.get('stock')
    const params = new URLSearchParams({ page: '1', limit: '1000000' })

    for (const [from, to] of [
      ['q', 'search'],
      ['category', 'category'],
      ['sort', 'sortBy'],
      ['dir', 'sortOrder'],
    ]) {
      const value = searchParams.get(from)

      if (value) params.set(to, value)
    }
    if (stock) params.set('inStock', String(stock === 'in'))

    try {
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()

      if (data.success && data.data.products) {
        exportProducts(data.data.products)
      } else {
        console.error('Export failed:', data.error)
      }
    } catch (err) {
      console.error('Error fetching products for export:', err)
    }
  }

  return (
    <div className='flex flex-wrap gap-2'>
      <input
        ref={fileInputRef}
        accept='.xlsx,.xls'
        className='hidden'
        type='file'
        onChange={e =>
          handleFileImport(e, categories, router.refresh, addToast)
        }
      />
      <button
        className={secondaryBtn}
        type='button'
        onClick={handleImportClick}
      >
        <Upload className='h-4 w-4' />
        Import Excel
      </button>
      <button className={secondaryBtn} type='button' onClick={handleExport}>
        <Download className='h-4 w-4' />
        Export Excel
      </button>
      <button
        className={primaryBtn}
        type='button'
        onClick={() => {
          setNewProductData(emptyProductForm)
          addModal.onOpen()
        }}
      >
        <Plus className='h-4 w-4' />
        Add product
      </button>

      <AddProductModal
        categories={categories}
        isOpen={addModal.isOpen}
        manufacturers={manufacturers}
        newProductData={newProductData}
        setNewProductData={setNewProductData}
        onOpenChange={addModal.onOpenChange}
        onSave={handleSaveNewProduct}
      />
    </div>
  )
}
