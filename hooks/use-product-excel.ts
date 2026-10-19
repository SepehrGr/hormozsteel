import type { ChangeEvent } from 'react'
import type { CategoryOption } from '@/components/admin/products/types'

import { useRef } from 'react'
import { addToast } from '@heroui/toast'
import * as XLSX from 'xlsx'

import { pluralize } from '@/lib/format'
import { SHEET, STOCK_LABEL } from '@/lib/product-sheet'

type Row = Record<string, unknown>

const cell = (row: Row, column: string) => String(row[column] ?? '').trim()

/** A number cell, allowing "1,250.50"; `undefined` when blank or not a number. */
const numberCell = (row: Row, column: string) => {
  const value = Number(cell(row, column).replace(/,/g, ''))

  return cell(row, column) && Number.isFinite(value) ? value : undefined
}

/**
 * Excel import for the products page: reads the sheet in the browser and
 * posts its rows to `/api/products/import`. A row with an ID updates that
 * product; one without creates a product. Blank cells on an update keep the
 * current value.
 */
export function useProductExcel(
  categories: CategoryOption[],
  onImported: () => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toRow = (row: Row) => {
    const categoryName = cell(row, SHEET.category).toLowerCase()
    const stock = cell(row, SHEET.stock)

    return {
      id: cell(row, SHEET.id) || undefined,
      name: cell(row, SHEET.name),
      brand: cell(row, SHEET.mill) || undefined,
      size: cell(row, SHEET.size),
      price: numberCell(row, SHEET.price),
      weight: numberCell(row, SHEET.weight),
      inStock: stock ? stock === STOCK_LABEL.in : undefined,
      categoryId:
        categories.find(c => c.name.toLowerCase() === categoryName)?.id ?? '',
      subcategory: cell(row, SHEET.subcategory),
    }
  }

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    try {
      const book = XLSX.read(await file.arrayBuffer())
      const rows = XLSX.utils
        .sheet_to_json<Row>(book.Sheets[book.SheetNames[0]])
        .map(toRow)
      // A new product needs everything the add form requires
      const incomplete = rows.filter(
        r =>
          !r.id &&
          !(r.name && r.brand && r.categoryId && r.subcategory && r.price),
      )

      if (incomplete.length > 0) {
        addToast({
          title: 'Import stopped',
          description: `${pluralize(incomplete.length, 'new row')} miss a name, mill, known category, sub-line or price. Fix them and import again.`,
          color: 'danger',
        })

        return
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: rows }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        addToast({
          title: 'Import failed',
          description: result?.error ?? `Server error (${response.status})`,
          color: 'danger',
        })

        return
      }

      const { updated, created, failed, errors } = result.results

      onImported()
      addToast({
        title: failed ? 'Imported with errors' : 'Imported',
        description: `${updated} updated, ${created} created, ${failed} failed.${errors[0] ? ` First error: ${errors[0]}` : ''}`,
        color: failed ? 'warning' : 'success',
      })
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
