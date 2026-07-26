'use client'

import { PriceFilter } from '@/types/products'
import { useCategories } from '@/hooks/use-api'
import { Filter, RefreshCw } from 'lucide-react'

interface AdvancedFiltersProps {
  filters: PriceFilter
  onFiltersChange: (filters: PriceFilter) => void
  onClearFilters: () => void
  showCategoryFilter?: boolean
  currentCategory?: string
  currentSubcategory?: string
  availableBrands?: string[]
  availableSizes?: string[]
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  showCategoryFilter = true,
  availableBrands = [],
  availableSizes = [],
}: AdvancedFiltersProps) {
  const { categories } = useCategories()

  const handleFilterChange = (key: keyof PriceFilter, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleMultiSelectFilter = (key: keyof PriceFilter, value: string) => {
    const currentValue = filters[key]
    let newValue: string | string[] | undefined

    if (Array.isArray(currentValue)) {
      if (currentValue.includes(value)) {
        newValue = currentValue.filter(item => item !== value)
        if (newValue.length === 0) newValue = undefined
      } else {
        newValue = [...currentValue, value]
      }
    } else if (currentValue === value) {
      newValue = undefined
    } else if (currentValue) {
      newValue = [currentValue as string, value]
    } else {
      newValue = value
    }

    handleFilterChange(key, newValue)
  }

  const isFilterActive = (key: keyof PriceFilter, value: string): boolean => {
    const currentValue = filters[key]
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value)
    }
    return currentValue === value
  }

  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== '' && value !== false,
  )

  const chipClass = (active: boolean) =>
    `px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <div className='sticky top-40 border border-border bg-card'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <h2 className='inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
          <Filter className='h-3.5 w-3.5' />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type='button'
            onClick={onClearFilters}
            className='inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            Clear
          </button>
        )}
      </div>

      <div className='space-y-5 px-4 py-4'>
        {showCategoryFilter && (
          <div>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Category
            </p>
            <div className='flex flex-col gap-1.5'>
              {categories.map(category => (
                <button
                  key={category.id}
                  type='button'
                  onClick={() =>
                    handleFilterChange(
                      'category',
                      filters.category === category.slug
                        ? undefined
                        : category.slug,
                    )
                  }
                  className={`justify-start text-left ${chipClass(
                    filters.category === category.slug,
                  )}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableBrands.length > 0 && (
          <div>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Mill / brand
            </p>
            <div className='flex max-h-48 flex-col gap-1.5 overflow-y-auto'>
              {availableBrands.map(brand => (
                <button
                  key={brand}
                  type='button'
                  onClick={() => handleMultiSelectFilter('brand', brand)}
                  className={`justify-start text-left ${chipClass(
                    isFilterActive('brand', brand),
                  )}`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableSizes.length > 0 && (
          <div>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Size
            </p>
            <div className='grid grid-cols-3 gap-1.5'>
              {availableSizes.map(size => (
                <button
                  key={size}
                  type='button'
                  onClick={() => handleMultiSelectFilter('size', size)}
                  className={chipClass(isFilterActive('size', size))}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Price range (USD)
          </p>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label
                htmlFor='minPrice'
                className='mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground'
              >
                Min
              </label>
              <input
                id='minPrice'
                type='number'
                min={0}
                step='0.01'
                value={filters.minPrice != null ? String(filters.minPrice) : ''}
                onChange={e =>
                  handleFilterChange(
                    'minPrice',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                className='w-full border border-border bg-background px-2.5 py-2 text-sm tabular-nums text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
                placeholder='0'
              />
            </div>
            <div>
              <label
                htmlFor='maxPrice'
                className='mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground'
              >
                Max
              </label>
              <input
                id='maxPrice'
                type='number'
                min={0}
                step='0.01'
                value={filters.maxPrice != null ? String(filters.maxPrice) : ''}
                onChange={e =>
                  handleFilterChange(
                    'maxPrice',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                className='w-full border border-border bg-background px-2.5 py-2 text-sm tabular-nums text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
                placeholder='—'
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type='button'
            onClick={() =>
              handleFilterChange('inStock', filters.inStock ? undefined : true)
            }
            className={`w-full text-left ${chipClass(Boolean(filters.inStock))}`}
          >
            In stock only
          </button>
        </div>
      </div>
    </div>
  )
}
