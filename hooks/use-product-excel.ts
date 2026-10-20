import type { ChangeEvent } from 'react'
import type { ProductImportRow } from '@/lib/schemas/product'

import { useRef } from 'react'
import { addToast } from '@heroui/toast'
import * as XLSX from 'xlsx'

import { importProducts } from '@/app/admin/(panel)/products/actions'
import { toastResult } from '@/lib/action-toast'
import { SHEET } from '@/lib/product-sheet'

type Row = Record<string, unknown>

/** A sheet row as text cells keyed like `SHEET`; the action checks them. */
const toRow = (row: Row) =>
  Object.fromEntries(
    Object.entries(SHEET).map(([key, column]) => [
      key,
      String(row[column] ?? '').trim(),
    ]),
  ) as ProductImportRow

/**
 * Excel import for the products page: reads the sheet in the browser and
 * sends its rows to the `importProducts` action. A row with an ID updates
 * that product; one without creates a product. Blank cells on an update keep
 * the current value.
 */
export function useProductExcel() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    try {
      const book = XLSX.read(await file.arrayBuffer())
      const rows = XLSX.utils
        .sheet_to_json<Row>(book.Sheets[book.SheetNames[0]])
        .map(toRow)

      toastResult(
        await importProducts(rows),
        ({ updated, created }) => `${updated} updated, ${created} added.`,
      )
    } catch (error) {
      console.error('Import failed:', error)
      addToast({
        title: 'Import failed',
        description: 'The file could not be read as an Excel sheet.',
        color: 'danger',
      })
    } finally {
      // Lets the same file be picked again after fixing it
      input.value = ''
    }
  }

  return {
    fileInputRef,
    handleFileImport,
    handleImportClick: () => fileInputRef.current?.click(),
  }
}
