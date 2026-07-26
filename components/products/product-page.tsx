'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Product,
  PriceFilter,
  productCategoryHref,
} from '@/types/products'
import { useCategories } from '@/hooks/use-api'
import { resolveCategoryIcon } from '@/config/category-icons'
import ProductTable from '@/components/products/product-table'
import AdvancedFilters from '@/components/products/advanced-filters'
import WeightCalculatorModal from '@/components/products/weight-calculator-modal'
import OrderRequestModal from '@/components/products/order-request-modal'
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
  const { categories } = useCategories()

  const categoryInfo = categories.find(
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
      if (
        !matchesFilter(
          filters.size as string | string[] | undefined,
          product.size,
        )
      )
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

  const availableBrands = useMemo(() => {
    return Array.from(
      new Set(
        products.map(p => p.brand).filter((b): b is string => Boolean(b)),
      ),
    ).sort()
  }, [products])

  const availableSizes = useMemo(() => {
    return Array.from(
      new Set(products.map(p => p.size).filter((s): s is string => Boolean(s))),
    ).sort((a, b) => {
      const na = parseFloat(a)
      const nb = parseFloat(b)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })
  }, [products])

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
          <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground' />
          <p className='text-sm text-muted-foreground'>
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
          <AlertCircle className='mx-auto mb-4 h-10 w-10 text-red-600 dark:text-red-400' />
          <h2 className='mb-2 text-lg font-semibold text-foreground'>
            Could not load prices
          </h2>
          <p className='mb-4 text-sm text-muted-foreground'>{error}</p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full bg-background'>
      {/* Header — editorial strip matching About / Contact */}
      <header className='border-b border-border'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
          <nav
            className='mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'
            aria-label='Breadcrumb'
          >
            <Link
              href='/products'
              className='transition-colors duration-200 ease-out hover:text-foreground'
            >
              Products
            </Link>
            <ChevronRight className='h-3 w-3' />
            <Link
              href={productCategoryHref(category)}
              className='transition-colors duration-200 ease-out hover:text-foreground'
            >
              {categoryInfo?.name ?? category}
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
                    className={`${iconClass} text-2xl text-foreground`}
                    aria-hidden
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
                  {stats.count}
                </dd>
              </div>
              <div className='bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Low
                </dt>
                <dd className='text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
                  {stats.count ? formatUsd(stats.min) : '—'}
                </dd>
              </div>
              <div className='bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  High
                </dt>
                <dd className='text-sm font-semibold tabular-nums text-amber-800 dark:text-amber-500'>
                  {stats.count ? formatUsd(stats.max) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className='sticky top-16 z-10 border-b border-border bg-background/95 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center md:px-6'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='search'
              placeholder='Search size, mill, or product name…'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
            />
          </div>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setShowFilters(v => !v)}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out ${
                showFilters
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              <Filter className='h-4 w-4' />
              Filters
            </button>
            <span className='hidden text-xs text-muted-foreground sm:inline'>
              {stats.inStock} of {stats.count} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Pricing board */}
      <div className='mx-auto max-w-7xl px-4 py-6 md:px-6'>
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
                availableBrands={availableBrands}
                availableSizes={availableSizes}
              />
            </aside>
          )}

          <div className={showFilters ? 'lg:col-span-3' : ''}>
            {filteredProducts.length === 0 ? (
              <div className='border border-dashed border-border bg-card px-6 py-16 text-center'>
                <Package className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
                <h3 className='mb-1 text-base font-semibold text-foreground'>
                  No matching line items
                </h3>
                <p className='text-sm text-muted-foreground'>
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
                    className='mt-4 text-sm font-medium text-foreground underline-offset-4 hover:underline'
                  >
                    Clear search & filters
                  </button>
                )}
              </div>
            ) : (
              <div className='space-y-8'>
                {Object.entries(productsByBrand).map(
                  ([brand, brandProducts]) => (
                    <section key={brand}>
                      <div className='mb-3 flex flex-wrap items-center gap-2'>
                        <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                          {brand}
                        </h2>
                        <span className='border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground'>
                          {brandProducts.length}{' '}
                          {brandProducts.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <ProductTable
                        products={brandProducts}
                        onOrder={handleOrder}
                        onCalculate={handleCalculate}
                        formatPrice={formatUsd}
                      />
                    </section>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Supporting info */}
        {(features.length > 0 ||
          applications.length > 0 ||
          Object.keys(specifications).length > 0) && (
          <div className='mt-12 grid grid-cols-1 gap-8 border-t border-border pt-10 lg:grid-cols-3'>
            {features.length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  <CheckCircle2 className='h-4 w-4 text-amber-800 dark:text-amber-500' />
                  Product notes
                </h3>
                <ul className='space-y-2 text-sm leading-relaxed text-muted-foreground'>
                  {features.map(item => (
                    <li key={item} className='flex gap-2'>
                      <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-border' />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {applications.length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  <Wrench className='h-4 w-4 text-amber-800 dark:text-amber-500' />
                  Typical use
                </h3>
                <ul className='space-y-2 text-sm leading-relaxed text-muted-foreground'>
                  {applications.map(item => (
                    <li key={item} className='flex gap-2'>
                      <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-border' />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {Object.keys(specifications).length > 0 && (
              <section>
                <h3 className='mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  <FileText className='h-4 w-4 text-amber-800 dark:text-amber-500' />
                  Specs
                </h3>
                <dl className='divide-y divide-border border border-border bg-card'>
                  {Object.entries(specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex justify-between gap-4 px-3 py-2 text-sm'
                    >
                      <dt className='text-muted-foreground'>{key}</dt>
                      <dd className='text-right font-medium text-foreground'>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        <p className='mt-8 flex items-start gap-2 text-xs text-muted-foreground'>
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
