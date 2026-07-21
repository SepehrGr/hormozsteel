import React from 'react'
import { Upload, Download, Plus } from 'lucide-react'

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement>
  onImportClick: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onExport: () => void
  onAdd: () => void
}

const secondaryBtn =
  'inline-flex cursor-pointer items-center gap-2 border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'

const primaryBtn =
  'inline-flex cursor-pointer items-center gap-2 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'

export default function HeaderActions({
  fileInputRef,
  onImportClick,
  onFileChange,
  onExport,
  onAdd,
}: Props) {
  return (
    <div className='flex flex-wrap gap-2'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.xlsx,.xls'
        onChange={onFileChange}
        className='hidden'
      />
      <button type='button' onClick={onImportClick} className={secondaryBtn}>
        <Upload className='h-4 w-4' />
        Import Excel
      </button>
      <button type='button' onClick={onExport} className={secondaryBtn}>
        <Download className='h-4 w-4' />
        Export Excel
      </button>
      <button type='button' onClick={onAdd} className={primaryBtn}>
        <Plus className='h-4 w-4' />
        Add product
      </button>
    </div>
  )
}
