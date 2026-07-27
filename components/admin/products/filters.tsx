import React from 'react'
import { Search, X, RefreshCw } from 'lucide-react'

interface Props {
  searchTerm: string
  setSearchTerm: (v: string) => void
  categoryFilter: string
  setCategoryFilter: (v: string) => void
  stockFilter: string
  setStockFilter: (v: string) => void
  categories: any[] | undefined
  selectedProductsCount: number
  onBulkOpen: () => void
  onDeleteOpen: () => void
  onClearFilters: () => void
}

const fieldClass =
  'w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

export default function Filters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  categories,
  selectedProductsCount,
  onBulkOpen,
  onDeleteOpen,
  onClearFilters,
}: Props) {
  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-5'>
      <div className='md:col-span-2'>
        <label className={labelClass}>Search</label>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              className={`${fieldClass} pl-9`}
              placeholder='Name or mill…'
              type='search'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm ? (
            <button
              aria-label='Clear search'
              className='inline-flex h-10 w-10 items-center justify-center border border-border bg-card text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground'
              type='button'
              onClick={() => setSearchTerm('')}
            >
              <X className='h-4 w-4' />
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor='admin-category-filter'>
          Category
        </label>
        <select
          className={fieldClass}
          id='admin-category-filter'
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value=''>All categories</option>
          {(categories || []).map((category: any) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor='admin-stock-filter'>
          Stock
        </label>
        <select
          className={fieldClass}
          id='admin-stock-filter'
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
        >
          <option value=''>All</option>
          <option value='true'>In stock</option>
          <option value='false'>Out of stock</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Actions</label>
        {selectedProductsCount > 0 ? (
          <div className='flex h-10 gap-2'>
            <button
              className='flex-1 border border-border bg-card px-2 text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={onBulkOpen}
            >
              Edit ({selectedProductsCount})
            </button>
            <button
              className='flex-1 border border-red-600/40 bg-red-50 px-2 text-xs font-medium text-red-800 transition-colors duration-200 ease-out hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200'
              type='button'
              onClick={onDeleteOpen}
            >
              Delete ({selectedProductsCount})
            </button>
          </div>
        ) : (
          <button
            className='inline-flex h-10 w-full items-center justify-center gap-2 border border-border bg-card text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={onClearFilters}
          >
            <RefreshCw className='h-4 w-4' />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
