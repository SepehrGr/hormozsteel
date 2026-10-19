import type { Column } from '@/components/admin/admin-table'
import type { ProductDTO } from '@/types/products'

import { useOptimistic, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { updateProducts } from '@/app/admin/products/actions'
import {
  AdminTable,
  RowActions,
  rowClass,
} from '@/components/admin/admin-table'
import { toastResult } from '@/lib/action-toast'
import { formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'

const checkboxClass = 'h-4 w-4 cursor-pointer accent-foreground'

export default function ProductsTable({
  products,
  selectedIds,
  sort,
  dir,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
}: {
  products: ProductDTO[]
  selectedIds: string[]
  sort: string
  dir: 'asc' | 'desc'
  onSelect: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (product: ProductDTO) => void
  onDelete: (product: ProductDTO) => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const allSelected = selectedIds.length === products.length
  const Arrow = dir === 'asc' ? ArrowUp : ArrowDown

  /** A header that sorts by `column`: ascending first, a second click flips it. */
  const sortable = (column: string, label: string): Column => {
    const active = sort === column
    const next = new URLSearchParams(searchParams)

    next.set('sort', column)
    next.set('dir', active && dir === 'asc' ? 'desc' : 'asc')
    next.delete('page')

    return {
      label: (
        <Link
          className='inline-flex items-center gap-1 hover:text-foreground'
          href={`${pathname}?${next}`}
        >
          {label}
          {active ? <Arrow aria-hidden className='h-3 w-3' /> : null}
        </Link>
      ),
      sort: active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined,
    }
  }

  const columns: Column[] = [
    {
      label: (
        <input
          ref={el => {
            if (el) el.indeterminate = selectedIds.length > 0 && !allSelected
          }}
          aria-label='Select all products on this page'
          checked={allSelected}
          className={checkboxClass}
          type='checkbox'
          onChange={e => onSelectAll(e.target.checked)}
        />
      ),
      className: 'w-12',
    },
    sortable('name', 'Product'),
    sortable('brand', 'Mill'),
    sortable('size', 'Size'),
    sortable('price', 'Price (USD)'),
    sortable('inStock', 'Stock'),
    sortable('category', 'Category'),
    { label: 'Sub-line' },
    { label: <span className='sr-only'>Actions</span>, className: 'w-24' },
  ]

  return (
    <AdminTable className='min-w-[960px]' columns={columns}>
      {products.map(product => {
        const selected = selectedIds.includes(product.id)

        return (
          <tr
            key={product.id}
            className={cn(rowClass, selected && 'bg-muted/40')}
          >
            <td className='px-4 py-3'>
              <input
                aria-label={`Select ${product.name}`}
                checked={selected}
                className={checkboxClass}
                type='checkbox'
                onChange={e => onSelect(product.id, e.target.checked)}
              />
            </td>
            <td className='px-4 py-3 font-medium text-foreground'>
              {product.name}
            </td>
            <td className='px-4 py-3 text-muted-foreground'>
              {product.brand || '—'}
            </td>
            <td className='px-4 py-3 font-mono text-xs tabular-nums text-foreground'>
              {product.size || '—'}
            </td>
            <td className='px-4 py-3'>
              <PriceCell product={product} />
            </td>
            <td className='px-4 py-3'>
              <StockToggle product={product} />
            </td>
            <td className='px-4 py-3'>
              <span className='border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground'>
                {product.category?.name}
              </span>
            </td>
            <td className='px-4 py-3 text-muted-foreground'>
              {product.subcategory}
            </td>
            <td className='px-4 py-3'>
              <RowActions
                name={product.name}
                onDelete={() => onDelete(product)}
                onEdit={() => onEdit(product)}
              />
            </td>
          </tr>
        )
      })}
    </AdminTable>
  )
}

/**
 * The unit price; click to edit, Enter or leaving the field saves, Escape
 * cancels. The new price shows at once and falls back if the save fails.
 */
function PriceCell({ product }: { product: ProductDTO }) {
  const [shown, setShown] = useOptimistic(product.price)
  const [, startTransition] = useTransition()
  const [draft, setDraft] = useState<string | null>(null)
  // Escape unmounts the input, and a blur on the way out mustn't save
  const cancelled = useRef(false)

  const save = () => {
    const price = Number(draft)

    setDraft(null)
    if (cancelled.current || !(price > 0) || price === shown) return

    startTransition(async () => {
      setShown(price)
      toastResult(
        await updateProducts({ ids: [product.id], changes: { price } }),
        `${product.name} now costs ${formatUsd(price)}`,
      )
    })
  }

  if (draft === null) {
    return (
      <button
        className='cursor-pointer font-mono text-sm font-semibold tabular-nums text-foreground hover:underline'
        title='Click to edit'
        type='button'
        onClick={() => {
          cancelled.current = false
          setDraft(String(shown))
        }}
      >
        {formatUsd(shown)}
      </button>
    )
  }

  return (
    <input
      // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the click that opened this inline editor
      autoFocus
      aria-label={`Unit price of ${product.name}`}
      className='h-8 w-28 border border-border bg-background px-2 font-mono text-sm font-semibold tabular-nums text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground'
      inputMode='decimal'
      min='0'
      step='0.01'
      type='number'
      value={draft}
      onBlur={save}
      onChange={e => setDraft(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          cancelled.current = true
          setDraft(null)
        }
      }}
    />
  )
}

/** In stock / Out as a button that flips it, shown at once like `PriceCell`. */
function StockToggle({ product }: { product: ProductDTO }) {
  const [inStock, setInStock] = useOptimistic(product.inStock)
  const [pending, startTransition] = useTransition()

  const toggle = () =>
    startTransition(async () => {
      setInStock(!inStock)
      toastResult(
        await updateProducts({
          ids: [product.id],
          changes: { inStock: !inStock },
        }),
        `${product.name} marked ${inStock ? 'out of stock' : 'in stock'}`,
      )
    })

  return (
    <button
      aria-label={`${product.name}: ${inStock ? 'in stock' : 'out of stock'}. Switch`}
      className={cn(
        'cursor-pointer border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors duration-200 ease-out disabled:cursor-wait',
        inStock
          ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200'
          : 'border-red-600/30 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200',
      )}
      disabled={pending}
      title='Click to toggle stock'
      type='button'
      onClick={toggle}
    >
      {inStock ? 'In stock' : 'Out'}
    </button>
  )
}
