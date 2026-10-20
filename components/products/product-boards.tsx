import type { Product } from '@/types/products'

import { useState } from 'react'
import { Package } from 'lucide-react'

import OrderRequestModal from '@/components/products/order-request-modal'
import ProductTable from '@/components/products/product-table'
import WeightCalculatorModal from '@/components/products/weight-calculator-modal'
import { formatUsd } from '@/lib/format'

function normalizeUnit(unit?: string | null) {
  const u = unit?.toLowerCase()

  if (!u) return undefined

  return u === 'ton' || u === 'piece' ? u : 'kg'
}

/** One price table per mill, with the row actions' calculator and quote dialogs. */
export function ProductBoards({
  products,
  categoryName,
}: {
  products: Product[]
  /** Picks the calculator when a product has no category of its own. */
  categoryName: string
}) {
  const [calculating, setCalculating] = useState<Product | null>(null)
  const [ordering, setOrdering] = useState<Product | null>(null)

  const byBrand = new Map<string, Product[]>()

  for (const product of products) {
    const brand = product.brand || 'Unspecified mill'

    byBrand.set(brand, [...(byBrand.get(brand) ?? []), product])
  }

  return (
    <>
      <div className='space-y-8'>
        {[...byBrand.keys()].sort().map(brand => {
          const rows = byBrand.get(brand)!

          return (
            <section key={brand}>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  {brand}
                </h2>
                <span className='border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground'>
                  {rows.length} {rows.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <ProductTable
                formatPrice={formatUsd}
                products={rows}
                onCalculate={setCalculating}
                onOrder={setOrdering}
              />
            </section>
          )
        })}
      </div>

      {calculating && (
        <WeightCalculatorModal
          formatPrice={formatUsd}
          productCategory={calculating.category?.name || categoryName}
          productName={calculating.name}
          productPrice={calculating.price}
          productUnit={normalizeUnit(calculating.unit)}
          onClose={() => setCalculating(null)}
        />
      )}

      {ordering && (
        <OrderRequestModal
          productName={ordering.name}
          productSpecs={`${ordering.name} · ${ordering.size} · ${ordering.brand ?? '—'}`}
          onClose={() => setOrdering(null)}
        />
      )}
    </>
  )
}

/** Empty board: what to do next, and a reset when filters caused it. */
export function NoMatches({
  message,
  onClear,
}: {
  message: string
  /** Shown as "Clear search & filters" when set. */
  onClear?: () => void
}) {
  return (
    <div className='border border-dashed border-border bg-card px-6 py-16 text-center'>
      <Package className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
      <h3 className='mb-1 text-base font-semibold text-foreground'>
        No matching line items
      </h3>
      <p className='text-sm text-muted-foreground'>{message}</p>
      {onClear && (
        <button
          className='mt-4 text-sm font-medium text-foreground underline-offset-4 hover:underline'
          type='button'
          onClick={onClear}
        >
          Clear search & filters
        </button>
      )}
    </div>
  )
}
