'use client'

import { Product } from '@/types/products'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Phone,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
  onCalculate: (product: Product) => void
}

export default function ProductCard({
  product,
  onOrder,
  onCalculate,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price)
  }

  const formatUpdateTime = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const isUp = (t?: string | null) =>
    t === 'increase' || t === 'UP' || t === 'افزایش'
  const isDown = (t?: string | null) =>
    t === 'decrease' || t === 'DOWN' || t === 'کاهش'

  const getPriceChangeIcon = () => {
    if (!product.priceHistory) return null
    const { changeType } = product.priceHistory
    if (isUp(changeType)) {
      return <TrendingUp className='w-4 h-4 text-green-500' />
    } else if (isDown(changeType)) {
      return <TrendingDown className='w-4 h-4 text-red-500' />
    } else {
      return <Minus className='w-4 h-4 text-slate-400' />
    }
  }

  const getPriceChangeBadge = () => {
    if (!product.priceHistory) return null

    const { changeType } = product.priceHistory

    let bgClass = 'bg-slate-100 text-slate-800 border-slate-200'
    let darkBgClass =
      'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'

    if (isUp(changeType)) {
      bgClass = 'bg-green-100 text-green-800 border-green-200'
      darkBgClass =
        'dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    } else if (isDown(changeType)) {
      bgClass = 'bg-red-100 text-red-800 border-red-200'
      darkBgClass = 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    }

    return (
      <Badge
        className={`${bgClass} ${darkBgClass} flex items-center justify-center p-2`}
        title={changeType}
        aria-label={changeType}
      >
        {getPriceChangeIcon()}
      </Badge>
    )
  }

  return (
    <div className='relative h-full group'>
      <div className='relative flex flex-col h-full min-h-[320px] p-6 transition-all duration-500 bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-400/5 hover:-translate-y-1 overflow-hidden'>
        {/* Price change badge (availability removed) */}
        <div className='relative z-10 flex items-center justify-end mb-4'>
          {getPriceChangeBadge()}
        </div>

        {/* Product title */}
        <div className='relative z-10 mb-4'>
          <h3 className='mb-2 text-lg font-bold leading-tight transition-colors duration-300 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
            {product.name}
          </h3>
          <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
            <span className='font-medium'>{product.brand}</span>
          </div>
        </div>

        {/* Price section */}
        <div className='relative z-10 p-4 mb-4 border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-blue-200/50 dark:border-blue-700/50'>
          <div className='flex items-baseline justify-between'>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatPrice(product.price)}
            </div>
            <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>
              / {String(product.unit || 'KG')}
            </div>
          </div>

          <div className='mt-2 pt-2 border-t border-blue-200/50 dark:border-blue-700/50 min-h-[28px]'>
            {product.priceHistory && product.priceHistory.changeAmount !== 0 ? (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  isUp(product.priceHistory.changeType)
                    ? 'text-green-600 dark:text-green-400'
                    : isDown(product.priceHistory.changeType)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {getPriceChangeIcon()}
                <span>
                  {formatPrice(Math.abs(product.priceHistory.changeAmount))}
                </span>
              </div>
            ) : (
              <div className='flex items-center gap-1 text-sm font-medium text-slate-400 dark:text-slate-500'>
                <Minus className='w-4 h-4' />
                <span>No change</span>
              </div>
            )}
          </div>
        </div>

        {/* Last updated */}
        <div className='relative z-10 mt-3 text-xs text-center text-slate-500 dark:text-slate-400'>
          {product.priceHistory?.changedAt ? (
            <>
              Price updated: {formatUpdateTime(product.priceHistory.changedAt)}
            </>
          ) : (
            <>Updated: {formatUpdateTime(product.lastUpdated)}</>
          )}
        </div>
      </div>
    </div>
  )
}
