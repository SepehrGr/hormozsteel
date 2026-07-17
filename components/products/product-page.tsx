'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Product,
  PriceFilter,
  PRODUCT_CATEGORIES,
  productCategoryHref,
} from '@/types/products'
import { resolveCategoryIcon } from '@/config/category-icons'
import CategoryTable from '@/components/products/category-table'
import AdvancedFilters from '@/components/products/advanced-filters'
import WeightCalculatorModal from '@/components/products/weight-calculator-modal'
import OrderRequestModal from '@/components/products/order-request-modal'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  Filter,
  Search,
  Package,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  FileText,
  Wrench,
} from 'lucide-react'

interface ProductPageProps {
  category: string
  subcategory: string
  title: string
  description?: string
  features?: string[]
  applications?: string[]
  specifications?: { [key: string]: string }
  productId?: string
  enableSheetsToggle?: boolean
}

function formatUsd(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function normalizeUnit(
  unit?: string | null,
): 'kg' | 'ton' | 'piece' | undefined {
  if (!unit) return undefined
  const u = unit.toLowerCase()
  if (u === 'kg' || u === 'ton' || u === 'piece') return u
  if (u === 'meter' || u === 'm') return 'kg'
  return 'kg'
}

export default function ProductPage({
  category,
  subcategory,
  title,
  description,
  features = [],
  applications = [],
  specifications = {},
}: ProductPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PriceFilter>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrderProduct, setSelectedOrderProduct] =
    useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const categoryInfo = PRODUCT_CATEGORIES.find(
    c => c.id === category || c.slug === category,
  )
  const iconClass = resolveCategoryIcon(
    categoryInfo?.icon ?? categoryInfo?.slug ?? category,
  )

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = `/api/products?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}&limit=1000`
        const response = await fetch(url)
        const data = await response.json()
        if (data.success) {
          setProducts(data.data.products)
        } else {
          setError(data.error || 'Failed to load products')
        }
      } catch {
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, subcategory])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (product.category?.slug && product.category.slug !== category) {
        return false
      }
      if (product.subcategory && product.subcategory !== subcategory) {
        return false
      }

      const matchesFilter = (
        filterValue: string | string[] | undefined,
        productValue: string | null | undefined,
      ) => {
        if (!filterValue) return true
        if (!productValue) return false
        if (Array.isArray(filterValue)) {
          return filterValue.includes(productValue)
        }
        return filterValue === productValue
      }

      if (!matchesFilter(filters.brand, product.brand)) return false
      if (!matchesFilter(filters.size as string | string[] | undefined, product.size))
        return false
      if (filters.minPrice != null && product.price < Number(filters.minPrice))
        return false
      if (filters.maxPrice != null && product.price > Number(filters.maxPrice))
        return false
      if (filters.inStock && !product.inStock) return false

      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const haystack = [
          product.name,
          product.brand,
          product.size,
          product.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [products, category, subcategory, filters, searchTerm])

  const productsByBrand = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    for (const product of filteredProducts) {
      const brand = product.brand || 'Unspecified mill'
      if (!grouped[brand]) grouped[brand] = []
      grouped[brand].push(product)
    }
    return grouped
  }, [filteredProducts])

  const stats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { count: 0, min: 0, max: 0, inStock: 0 }
    }
    const prices = filteredProducts.map(p => p.price)
    return {
      count: filteredProducts.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      inStock: filteredProducts.filter(p => p.inStock).length,
    }
  }, [filteredProducts])

  const handleOrder = (product: Product) => {
    setSelectedOrderProduct(product)
    setIsOrderModalOpen(true)
  }

  const handleCalculate = (product: Product) => {
    setSelectedProduct(product)
    setIsCalculatorOpen(true)
  }

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200' />
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            Loading catalog prices…
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center px-4'>
        <div className='max-w-md text-center'>
          <AlertCircle className='mx-auto mb-4 h-10 w-10 text-red-600' />
          <h2 className='mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Could not load prices
          </h2>
          <p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
            {error}
          </p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full bg-slate-50 dark:bg-slate-950'>
      {/* Header — terminal-style strip, not marketing hero */}
      <header className='border-b border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6'>
          <nav
            className='mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-400'
            aria-label='Breadcrumb'
          >
            <Link href='/products' className='hover:text-slate-200'>
              Products
            </Link>
            <ChevronRight className='h-3 w-3' />
            <Link
              href={productCategoryHref(category)}
              className='hover:text-slate-200'
            >
              {categoryInfo?.name ?? category}
            </Link>
            <ChevronRight className='h-3 w-3' />
            <span className='text-slate-200'>{subcategory}</span>
          </nav>

          <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800'>
                <i className={`${iconClass} text-2xl text-amber-500`} />
              </div>
              <div>
                <p className='mb-1 text-xs font-medium uppercase tracking-wider text-slate-400'>
                  Unit prices · USD
                </p>
                <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {title}
                </h1>
                {description && (
                  <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-400'>
                    {description}
                  </p>
                )}
              </div>
            </div>

            <dl className='grid grid-cols-3 gap-px overflow-hidden rounded-md border border-slate-700 bg-slate-700 sm:min-w-[280px]'>
              <div className='bg-slate-900 px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-slate-500'>
                  Lines
                </dt>
                <dd className='text-lg font-semibold tabular-nums'>
                  {stats.count}
                </dd>
              </div>
              <div className='bg-slate-900 px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-slate-500'>
                  Low
                </dt>
                <dd className='text-sm font-semibold tabular-nums text-emerald-400'>
                  {stats.count ? formatUsd(stats.min) : '—'}
                </dd>
              </div>
              <div className='bg-slate-900 px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-slate-500'>
                  High
                </dt>
                <dd className='text-sm font-semibold tabular-nums text-amber-400'>
                  {stats.count ? formatUsd(stats.max) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className='sticky top-16 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='search'
              placeholder='Search size, mill, or product name…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
            />
          </div>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setShowFilters(v => !v)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Filter className='h-4 w-4' />
              Filters
            </button>
            <span className='hidden text-xs text-slate-500 sm:inline'>
              {stats.inStock} of {stats.count} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Pricing board */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6'>
        <div
          className={`grid grid-cols-1 gap-6 ${showFilters ? 'lg:grid-cols-4' : ''}`}
        >
          {showFilters && (
            <aside className='lg:col-span-1'>
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters({})}
                showCategoryFilter={false}
                currentCategory={category}
                currentSubcategory={subcategory}
              />
            </aside>
          )}

          <div className={showFilters ? 'lg:col-span-3' : ''}>
            {filteredProducts.length === 0 ? (
              <div className='rounded-md border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900'>
                <Package className='mx-auto mb-3 h-10 w-10 text-slate-400' />
                <h3 className='mb-1 text-base font-semibold text-slate-800 dark:text-slate-200'>
                  No matching line items
                </h3>
                <p className='text-sm text-slate-500'>
                  Adjust search or filters, or clear filters to see the full
                  list.
                </p>
                {(searchTerm || Object.keys(filters).length > 0) && (
                  <button
                    type='button'
                    onClick={() => {
                      setSearchTerm('')
                      setFilters({})
                    }}
                    className='mt-4 text-sm font-medium text-slate-900 underline-offset-4 hover:underline dark:text-slate-100'
                  >
                    Clear search & filters
                  </button>
                )}
              </div>
            ) : (
              <div className='space-y-8'>
                {Object.entries(productsByBrand).map(([brand, brandProducts]) => (
                  <section key={brand}>
                    <div className='mb-3 flex flex-wrap items-center gap-2'>
                      <h2 className='text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300'>
                        {brand}
                      </h2>
                      <Badge className='bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'>
                        {brandProducts.length}{' '}
                        {brandProducts.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                    <CategoryTable
                      category={categoryInfo!}
                      products={brandProducts}
                      onOrder={handleOrder}
                      onCalculate={handleCalculate}
                      formatPrice={formatUsd}
                    />
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Supporting info — editorial, not feature cards soup */}
        {(features.length > 0 ||
          applications.length > 0 ||
          Object.keys(specifications).length > 0) && (
          <div className='mt-12 grid grid-cols-1 gap-8 border-t border-slate-200 pt-10 dark:border-slate-800 lg:grid-cols-3'>
            {features.length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200'>
                  <CheckCircle2 className='h-4 w-4 text-amber-600' />
                  Product notes
                </h3>
                <ul className='space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                  {features.map(item => (
                    <li key={item} className='flex gap-2'>
                      <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400' />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {applications.length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200'>
                  <Wrench className='h-4 w-4 text-amber-600' />
                  Typical use
                </h3>
                <ul className='space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                  {applications.map(item => (
                    <li key={item} className='flex gap-2'>
                      <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400' />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {Object.keys(specifications).length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200'>
                  <FileText className='h-4 w-4 text-amber-600' />
                  Specs
                </h3>
                <dl className='divide-y divide-slate-200 border border-slate-200 dark:divide-slate-800 dark:border-slate-800'>
                  {Object.entries(specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex justify-between gap-4 px-3 py-2 text-sm'
                    >
                      <dt className='text-slate-500'>{key}</dt>
                      <dd className='text-right font-medium text-slate-800 dark:text-slate-200'>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        <p className='mt-8 flex items-start gap-2 text-xs text-slate-500'>
          <Calculator className='mt-0.5 h-3.5 w-3.5 shrink-0' />
          Prices are demo unit rates in USD. Use the calculator action on a row
          for weight estimates where available.
        </p>
      </div>

      <WeightCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => {
          setIsCalculatorOpen(false)
          setSelectedProduct(null)
        }}
        productName={selectedProduct?.name}
        productCategory={selectedProduct?.category?.name || category}
        productPrice={selectedProduct?.price}
        productUnit={normalizeUnit(selectedProduct?.unit)}
        formatPrice={formatUsd}
      />

      <OrderRequestModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false)
          setSelectedOrderProduct(null)
        }}
        productName={selectedOrderProduct?.name}
        productSpecs={
          selectedOrderProduct
            ? `${selectedOrderProduct.name} · ${selectedOrderProduct.size} · ${selectedOrderProduct.brand ?? '—'}`
            : ''
        }
      />
    </div>
  )
}
