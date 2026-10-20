import type { Product } from '@/types/products'

import { useMemo } from 'react'
import {
  Calculator,
  Package,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react'

import { formatUsd } from '@/lib/format'

interface ProductTableProps {
  products: Product[]
  onOrder: (product: Product) => void
  onCalculate: (product: Product) => void
  formatPrice?: (price: number) => string
}

function directionMeta(product: Product) {
  const raw = product.priceHistory?.changeType || product.priceDirection || ''
  const t = String(raw).toLowerCase()

  if (t === 'up' || t === 'increase' || t === 'افزایش') {
    return {
      label: 'Up',
      className: 'text-emerald-600 dark:text-emerald-400',
      Icon: TrendingUp,
    }
  }
  if (t === 'down' || t === 'decrease' || t === 'کاهش') {
    return {
      label: 'Down',
      className: 'text-red-600 dark:text-red-400',
      Icon: TrendingDown,
    }
  }

  return {
    label: 'Flat',
    className: 'text-muted-foreground',
    Icon: Minus,
  }
}

export default function ProductTable({
  products,
  onOrder,
  onCalculate,
  formatPrice: customFormatPrice,
}: ProductTableProps) {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const na = parseFloat(a.size)
      const nb = parseFloat(b.size)

      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        if (na === nb) return a.name.localeCompare(b.name)

        return na - nb
      }

      return a.size.localeCompare(b.size)
    })
  }, [products])

  const formatPrice = customFormatPrice || formatUsd

  if (products.length === 0) {
    return (
      <div className='border border-border bg-card py-10 text-center'>
        <Package className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>
          No products in this group
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-hidden border border-border bg-card'>
      <div className='overflow-x-auto'>
        {/* Desktop */}
        <table className='hidden w-full min-w-[640px] table-fixed lg:table'>
          <colgroup>
            <col style={{ width: '32%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
              <th className='px-4 py-3'>Product</th>
              <th className='px-3 py-3 text-center'>Size</th>
              <th className='px-3 py-3 text-center'>Weight</th>
              <th className='px-3 py-3 text-right'>Unit price</th>
              <th className='px-3 py-3 text-center'>Move</th>
              <th className='px-3 py-3 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {sortedProducts.map(product => {
              const move = directionMeta(product)
              const MoveIcon = move.Icon
              const weight =
                product.weightKg != null
                  ? `${Number(product.weightKg).toFixed(2)} kg`
                  : '—'

              return (
                <tr
                  key={product.id}
                  className='text-sm transition-colors duration-200 ease-out hover:bg-muted/50'
                >
                  <td className='px-4 py-3'>
                    <div className='font-medium text-foreground'>
                      {product.name}
                    </div>
                    {!product.inStock && (
                      <span className='border border-amber-700/30 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200'>
                        Limited / Inquiry
                      </span>
                    )}
                  </td>
                  <td className='px-3 py-3 text-center'>
                    <span className='inline-block border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs tabular-nums text-foreground'>
                      {product.size}
                    </span>
                  </td>
                  <td className='px-3 py-3 text-center font-mono text-xs tabular-nums text-muted-foreground'>
                    {weight}
                  </td>
                  <td className='px-3 py-3 text-right font-semibold tabular-nums text-foreground'>
                    {product.price > 0 ? formatPrice(product.price) : 'Quote'}
                    <div className='text-[10px] font-normal uppercase tracking-wide text-muted-foreground'>
                      / {String(product.unit || 'KG').toLowerCase()}
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-center ${move.className}`}>
                    <span className='inline-flex items-center justify-center gap-1 text-xs font-medium'>
                      <MoveIcon className='h-3.5 w-3.5' />
                      {product.priceDelta != null && product.priceDelta !== 0
                        ? formatPrice(Math.abs(Number(product.priceDelta)))
                        : move.label}
                    </span>
                  </td>
                  <td className='px-3 py-3'>
                    <div className='flex items-center justify-center gap-1.5'>
                      <button
                        className='inline-flex h-8 cursor-pointer items-center border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                        type='button'
                        onClick={() => onOrder(product)}
                      >
                        Request
                      </button>
                      <button
                        aria-label={`Weight calculator for ${product.name}`}
                        className='inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                        title='Weight calculator'
                        type='button'
                        onClick={() => onCalculate(product)}
                      >
                        <Calculator className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile */}
        <table className='w-full table-fixed lg:hidden'>
          <thead>
            <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
              <th className='px-3 py-2.5'>Product</th>
              <th className='px-2 py-2.5 text-right'>Price</th>
              <th className='w-20 px-2 py-2.5 text-center'> </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {sortedProducts.map(product => (
              <tr key={`m-${product.id}`} className='text-sm'>
                <td className='px-3 py-3'>
                  <div className='font-medium leading-snug text-foreground'>
                    {product.name}
                  </div>
                  <div className='mt-1 text-xs text-muted-foreground'>
                    Size{' '}
                    <span className='font-mono tabular-nums text-foreground'>
                      {product.size}
                    </span>
                  </div>
                </td>
                <td className='px-2 py-3 text-right font-semibold tabular-nums text-foreground'>
                  {product.price > 0 ? formatPrice(product.price) : 'Quote'}
                </td>
                <td className='px-2 py-3 text-center'>
                  <button
                    className='inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted'
                    title='Request quote'
                    type='button'
                    onClick={() => onOrder(product)}
                  >
                    <Package className='h-3.5 w-3.5' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
