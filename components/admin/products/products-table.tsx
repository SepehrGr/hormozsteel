import type { Column } from '@/components/admin/admin-table'
import type { ProductDTO } from '@/types/products'
import type { ComponentProps } from 'react'

import { useOptimistic, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { updateProducts } from '@/app/admin/products/actions'
import {
  actionsColumn,
  AdminTable,
  RowActions,
} from '@/components/admin/admin-table'
import { toastResult } from '@/lib/action-toast'
import { formatUsd } from '@/lib/format'
import { cn } from '@/lib/utils'

const checkboxClass = 'h-4 w-4 cursor-pointer accent-foreground'

/** A checkbox with a 44px touch target around it. */
function Checkbox(props: ComponentProps<'input'>) {
  return (
    <label className='inline-flex cursor-pointer pointer-coarse:-m-3.5 pointer-coarse:p-3.5'>
      <input className={checkboxClass} type='checkbox' {...props} />
    </label>
  )
}

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
  const sortable = (
    column: string,
    label: string,
  ): Pick<Column<ProductDTO>, 'label' | 'title' | 'sort'> => {
    const active = sort === column
    const next = new URLSearchParams(searchParams)

    next.set('sort', column)
    next.set('dir', active && dir === 'asc' ? 'desc' : 'asc')
    next.delete('page')

    return {
      label: (
        <Link
          className='inline-flex items-center gap-1 hover:text-foreground pointer-coarse:-my-3.5 pointer-coarse:py-3.5'
          href={`${pathname}?${next}`}
        >
          {label}
          {active ? <Arrow aria-hidden className='h-3 w-3' /> : null}
        </Link>
      ),
      title: label,
      sort: active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined,
    }
  }

  const columns: Column<ProductDTO>[] = [
    {
      label: (
        <Checkbox
          ref={el => {
            if (el) el.indeterminate = selectedIds.length > 0 && !allSelected
          }}
          aria-label='Select all products on this page'
          checked={allSelected}
          onChange={e => onSelectAll(e.target.checked)}
        />
      ),
      className: 'w-12',
      narrow: 'summary',
      narrowHeader: true,
      cell: product => (
        <Checkbox
          aria-label={`Select ${product.name}`}
          checked={selectedIds.includes(product.id)}
          onChange={e => onSelect(product.id, e.target.checked)}
        />
      ),
    },
    {
      ...sortable('name', 'Product'),
      narrow: 'title',
      narrowHeader: true,
      cellClassName: 'font-medium text-foreground',
      cell: product => product.name,
    },
    {
      ...sortable('brand', 'Mill'),
      cellClassName: 'text-muted-foreground',
      cell: product => product.brand || '—',
    },
    {
      ...sortable('size', 'Size'),
      cellClassName: 'font-mono text-xs tabular-nums text-foreground',
      cell: product => product.size || '—',
    },
    {
      ...sortable('price', 'Price (USD)'),
      narrow: 'summary',
      narrowHeader: true,
      cell: product => <PriceCell product={product} />,
    },
    {
      ...sortable('inStock', 'Stock'),
      cell: product => (
        <div>
          <StockToggle product={product} />
        </div>
      ),
    },
    {
      ...sortable('category', 'Category'),
      cell: product => (
        <div>
          <span className='border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground'>
            {product.category?.name}
          </span>
        </div>
      ),
    },
    {
      label: 'Sub-line',
      cellClassName: 'text-muted-foreground',
      cell: product => product.subcategory,
    },
    actionsColumn(product => (
      <RowActions
        name={product.name}
        onDelete={() => onDelete(product)}
        onEdit={() => onEdit(product)}
      />
    )),
  ]

  return (
    <AdminTable
      wide
      columns={columns}
      rowClassName={product =>
        selectedIds.includes(product.id) && 'bg-muted/40'
      }
      rowLabel={product => `Details of ${product.name}`}
      rows={products}
    />
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
        await updateProducts({
          ids: [product.id],
          changes: { price: String(price) },
        }),
        `${product.name} now costs ${formatUsd(price)}`,
      )
    })
  }

  if (draft === null) {
    return (
      <button
        className='cursor-pointer font-mono text-sm font-semibold tabular-nums text-foreground hover:underline pointer-coarse:-my-3 pointer-coarse:py-3'
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
      className='h-8 w-28 border border-border bg-background px-2 pointer-coarse:h-11 font-mono text-sm font-semibold tabular-nums text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground'
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
          changes: { stock: inStock ? 'out' : 'in' },
        }),
        `${product.name} marked ${inStock ? 'out of stock' : 'in stock'}`,
      )
    })

  return (
    <button
      aria-label={`${product.name}: ${inStock ? 'in stock' : 'out of stock'}. Switch`}
      className={cn(
        'cursor-pointer border px-2 py-0.5 text-[11px] font-medium pointer-coarse:px-3 pointer-coarse:py-2.5 uppercase tracking-wide transition-colors duration-200 ease-out disabled:cursor-wait',
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
