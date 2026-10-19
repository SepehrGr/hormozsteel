'use client'

import type { CategoryOption } from '@/components/admin/products/types'

import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProductExcel } from '@/hooks/use-product-excel'

/** Picks an .xlsx file and imports it; the page re-reads afterwards. */
export function ImportExcelButton({
  categories,
}: {
  categories: CategoryOption[]
}) {
  const router = useRouter()
  const { fileInputRef, handleFileImport, handleImportClick } = useProductExcel(
    categories,
    router.refresh,
  )

  return (
    <>
      <input
        ref={fileInputRef}
        accept='.xlsx,.xls'
        className='hidden'
        type='file'
        onChange={handleFileImport}
      />
      <Button variant='outline' onClick={handleImportClick}>
        <Upload aria-hidden className='h-4 w-4' />
        Import Excel
      </Button>
    </>
  )
}
