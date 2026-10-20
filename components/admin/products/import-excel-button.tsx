'use client'

import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProductExcel } from '@/hooks/use-product-excel'

/** Picks an .xlsx file and imports it. */
export function ImportExcelButton() {
  const { fileInputRef, handleFileImport, handleImportClick } =
    useProductExcel()

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
