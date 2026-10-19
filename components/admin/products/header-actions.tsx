'use client'

import type { CategoryOption } from '@/components/admin/products/types'

import { useRouter, useSearchParams } from 'next/navigation'
import { addToast } from '@heroui/toast'
import { Upload, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProductExcel } from '@/hooks/use-product-excel'

/** Excel import and export. */
export default function HeaderActions({
  categories,
}: {
  categories: CategoryOption[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fileInputRef, exportProducts, handleFileImport, handleImportClick } =
    useProductExcel()

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
    <>
      <input
        ref={fileInputRef}
        accept='.xlsx,.xls'
        className='hidden'
        type='file'
        onChange={e =>
          handleFileImport(e, categories, router.refresh, addToast)
        }
      />
      <Button variant='outline' onClick={handleImportClick}>
        <Upload aria-hidden className='h-4 w-4' />
        Import Excel
      </Button>
      <Button variant='outline' onClick={handleExport}>
        <Download aria-hidden className='h-4 w-4' />
        Export Excel
      </Button>
    </>
  )
}
