'use client'

import React, { useState } from 'react'
import type { Product, ProductCategory } from '@/types/products'
import { Button } from '@/components/ui/button'
import OrderRequestModal from '@/components/products/order-request-modal'
import { Calculator, Package, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface CategoryTableProps {
  category?: ProductCategory
  products: Product[]
  onOrder: (product: Product) => void
  onCalculate: (product: Product) => void
  formatPrice?: (price: number) => string
}

function formatUsd(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function directionMeta(product: Product) {
  const raw =
    product.priceHistory?.changeType ||
    product.priceDirection ||
    ''
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
    className: 'text-slate-400',
    Icon: Minus,
  }
}

export default function CategoryTable({
  products,
  onOrder,
  onCalculate,
  formatPrice: customFormatPrice,
}: CategoryTableProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<{
    name?: string
    specs?: string
  } | null>(null)

  const sortedProducts = React.useMemo(() => {
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

  const openOrderModal = (product: Product) => {
    setSelectedProductForOrder({
      name: product.name,
      specs: product.description || undefined,
    })
    setIsOrderModalOpen(true)
    onOrder(product)
  }

  if (products.length === 0) {
    return (
      <div className='rounded-md border border-slate-200 bg-white py-10 text-center dark:border-slate-800 dark:bg-slate-900'>
        <Package className='mx-auto mb-3 h-10 w-10 text-slate-400' />
        <p className='text-sm text-slate-500'>No products in this group</p>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'>
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
            <tr className='border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'>
              <th className='px-4 py-3'>Product</th>
              <th className='px-3 py-3 text-center'>Size</th>
              <th className='px-3 py-3 text-center'>Weight</th>
              <th className='px-3 py-3 text-right'>Unit price</th>
              <th className='px-3 py-3 text-center'>Move</th>
              <th className='px-3 py-3 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
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
                  className='text-sm hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                >
                  <td className='px-4 py-3'>
                    <div className='font-medium text-slate-900 dark:text-slate-100'>
                      {product.name}
                    </div>
                    <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                      {product.brand && <span>{product.brand}</span>}
                      {!product.inStock && (
                        <span className='rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-950 dark:text-amber-200'>
                          Limited / inquiry
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-3 py-3 text-center'>
                    <span className='inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'>
                      {product.size}
                    </span>
                  </td>
                  <td className='px-3 py-3 text-center tabular-nums text-slate-600 dark:text-slate-400'>
                    {weight}
                  </td>
                  <td className='px-3 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100'>
                    {product.price > 0 ? formatPrice(product.price) : 'Quote'}
                    <div className='text-[10px] font-normal uppercase text-slate-400'>
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
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => openOrderModal(product)}
                        className='h-8 cursor-pointer text-xs'
                      >
                        Request
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onCalculate(product)}
                        className='h-8 cursor-pointer px-2'
                        title='Weight calculator'
                      >
                        <Calculator className='h-3.5 w-3.5' />
                      </Button>
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
            <tr className='border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'>
              <th className='px-3 py-2.5'>Product</th>
              <th className='px-2 py-2.5 text-right'>Price</th>
              <th className='w-20 px-2 py-2.5 text-center'> </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
            {sortedProducts.map(product => (
              <tr key={`m-${product.id}`} className='text-sm'>
                <td className='px-3 py-3'>
                  <div className='font-medium leading-snug text-slate-900 dark:text-slate-100'>
                    {product.name}
                  </div>
                  <div className='mt-1 text-xs text-slate-500'>
                    Size{' '}
                    <span className='font-mono text-slate-800 dark:text-slate-200'>
                      {product.size}
                    </span>
                  </div>
                </td>
                <td className='px-2 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100'>
                  {product.price > 0 ? formatPrice(product.price) : 'Quote'}
                </td>
                <td className='px-2 py-3 text-center'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => openOrderModal(product)}
                    className='h-8 cursor-pointer px-2'
                  >
                    <Package className='h-3.5 w-3.5' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderRequestModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        productName={selectedProductForOrder?.name}
        productSpecs={selectedProductForOrder?.specs}
      />
    </div>
  )
}
