'use client'

import type { ReactNode } from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, Search, ChevronRight } from 'lucide-react'

import {
  Product,
  PriceFilter,
  ProductCategory,
  productCategoryHref,
} from '@/types/products'
import { resolveCategoryIcon } from '@/config/category-icons'
import AdvancedFilters from '@/components/products/advanced-filters'
import { NoMatches, ProductBoards } from '@/components/products/product-boards'
import { formatUsd } from '@/lib/format'
import { matchesSearch } from '@/lib/utils'

interface ProductPageProps {
  category: ProductCategory
  subcategory: string
  title: string
  description?: string
  products: Product[]
  /** Static notes under the board, rendered on the server. */
  children?: ReactNode
}

function matchesFilter(
  filterValue: string | string[] | undefined,
  productValue: string | null | undefined,
) {
  if (!filterValue) return true
  if (!productValue) return false

  return Array.isArray(filterValue)
    ? filterValue.includes(productValue)
    : filterValue === productValue
}

const uniqueSorted = (
  values: (string | null | undefined)[],
  compare?: (a: string, b: string) => number,
) => [...new Set(values.filter(Boolean) as string[])].sort(compare)

/** Numbers first in numeric order ("8mm" before "10mm"), then labels. */
function compareSizes(a: string, b: string) {
  const na = parseFloat(a)
  const nb = parseFloat(b)

  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb

  return a.localeCompare(b)
}

export default function ProductPage({
  category,
  subcategory,
  title,
  description,
  products,
  children,
}: ProductPageProps) {
  const [filters, setFilters] = useState<PriceFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = products.filter(
    product =>
      matchesFilter(filters.brand, product.brand) &&
      matchesFilter(filters.size, product.size) &&
      (filters.minPrice == null || product.price >= filters.minPrice) &&
      (filters.maxPrice == null || product.price <= filters.maxPrice) &&
      (!filters.inStock || product.inStock) &&
      matchesSearch(searchTerm, [
        product.name,
        product.brand,
        product.size,
        product.description,
      ]),
  )
  const inStock = filteredProducts.filter(p => p.inStock).length
  const filtered = searchTerm !== '' || Object.keys(filters).length > 0

  return (
    <div className='w-full bg-background'>
      <ProductHeader
        category={category}
        description={description}
        products={filteredProducts}
        subcategory={subcategory}
        title={title}
      />

      {/* Toolbar */}
      <div className='sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center md:px-6'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              aria-label='Search products'
              className='w-full border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
              placeholder='Search size, mill, or product name…'
              type='search'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center gap-2'>
            <button
              aria-expanded={showFilters}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out ${
                showFilters
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
              type='button'
              onClick={() => setShowFilters(v => !v)}
            >
              <Filter className='h-4 w-4' />
              Filters
            </button>
            <span className='hidden text-xs text-muted-foreground sm:inline'>
              {inStock} of {filteredProducts.length} in stock
            </span>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
        <div
          className={`grid grid-cols-1 gap-6 ${showFilters ? 'lg:grid-cols-4' : ''}`}
        >
          {showFilters && (
            <aside className='lg:col-span-1'>
              <AdvancedFilters
                availableBrands={uniqueSorted(products.map(p => p.brand))}
                availableSizes={uniqueSorted(
                  products.map(p => p.size),
                  compareSizes,
                )}
                filters={filters}
                onClearFilters={() => setFilters({})}
                onFiltersChange={setFilters}
              />
            </aside>
          )}

          <div className={showFilters ? 'lg:col-span-3' : ''}>
            {filteredProducts.length > 0 ? (
              <ProductBoards
                categoryName={category.name}
                products={filteredProducts}
              />
            ) : (
              <NoMatches
                message='Adjust search or filters, or clear filters to see the full list.'
                onClear={
                  filtered
                    ? () => {
                        setSearchTerm('')
                        setFilters({})
                      }
                    : undefined
                }
              />
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}

function ProductHeader({
  category,
  subcategory,
  title,
  description,
  products,
}: Pick<
  ProductPageProps,
  'category' | 'subcategory' | 'title' | 'description'
> & {
  products: Product[]
}) {
  const prices = products.map(p => p.price)
  const iconClass = resolveCategoryIcon(category.icon ?? category.slug)

  return (
    <header className='border-b border-border'>
      <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
        <nav
          aria-label='Breadcrumb'
          className='mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'
        >
          <Link
            className='transition-colors duration-200 ease-out hover:text-foreground'
            href='/products'
          >
            Products
          </Link>
          <ChevronRight className='h-3 w-3' />
          <Link
            className='transition-colors duration-200 ease-out hover:text-foreground'
            href={productCategoryHref(category.slug)}
          >
            {category.name}
          </Link>
          <ChevronRight className='h-3 w-3' />
          <span className='text-foreground'>{subcategory}</span>
        </nav>

        <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
          <div className='lg:col-span-7'>
            <div className='mb-3 flex items-center gap-3'>
              <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                Unit prices · USD
              </span>
            </div>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-card'>
                <i
                  aria-hidden
                  className={`${iconClass} text-2xl text-foreground`}
                />
              </div>
              <div>
                <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
                  {title}
                </h1>
                {description && (
                  <p className='mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground'>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <dl className='grid grid-cols-3 gap-px overflow-hidden border border-border bg-border sm:min-w-[280px] lg:col-span-5'>
            <div className='bg-card px-3 py-2.5'>
              <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                Lines
              </dt>
              <dd className='font-mono text-lg font-semibold tabular-nums text-foreground'>
                {products.length}
              </dd>
            </div>
            <div className='bg-card px-3 py-2.5'>
              <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                Low
              </dt>
              <dd className='text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
                {prices.length ? formatUsd(Math.min(...prices)) : '—'}
              </dd>
            </div>
            <div className='bg-card px-3 py-2.5'>
              <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                High
              </dt>
              <dd className='text-sm font-semibold tabular-nums text-amber-800 dark:text-amber-500'>
                {prices.length ? formatUsd(Math.max(...prices)) : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  )
}
