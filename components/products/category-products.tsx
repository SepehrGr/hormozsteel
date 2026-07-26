'use client'

import { useState, useMemo, useEffect } from 'react'
import ProductTable from '@/components/products/product-table'
import WeightCalculatorModal from '@/components/products/weight-calculator-modal'
import OrderRequestModal from '@/components/products/order-request-modal'
import { Product, ProductCategory } from '@/types/products'
import { Search, Package, AlertCircle } from 'lucide-react'

interface CategoryProductsProps {
  category: ProductCategory
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

export default function CategoryProducts({ category }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrderProduct, setSelectedOrderProduct] =
    useState<Product | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = `/api/products?category=${encodeURIComponent(category.id)}&limit=1000`
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
  }, [category.id])

  const filteredProducts = useMemo(() => {
    let list = products
    if (selectedSubcategory !== 'all') {
      list = list.filter(p => p.subcategory === selectedSubcategory)
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter(product => {
        const haystack = [
          product.name,
          product.brand,
          product.size,
          product.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    return list
  }, [products, selectedSubcategory, searchTerm])

  const availableSubcategories = useMemo(() => {
    return Array.from(
      new Set(
        products.map(p => p.subcategory).filter((s): s is string => Boolean(s)),
      ),
    ).sort()
  }, [products])

  const productsByBrand = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    for (const product of filteredProducts) {
      const brand = product.brand || 'Unspecified mill'
      if (!grouped[brand]) grouped[brand] = []
      grouped[brand].push(product)
    }
    return grouped
  }, [filteredProducts])

  const sortedBrands = Object.keys(productsByBrand).sort()

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
      <div className='flex min-h-[40vh] items-center justify-center'>
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
      <div className='flex min-h-[40vh] items-center justify-center px-4'>
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
    <>
      {/* Toolbar */}
      <div className='mb-6 border border-border bg-card'>
        <div className='flex items-center justify-between border-b border-border px-4 py-3'>
          <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Search & filters
          </h2>
          <span className='text-xs tabular-nums text-muted-foreground'>
            {filteredProducts.length} of {products.length} lines
          </span>
        </div>

        <div className='space-y-4 px-4 py-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative flex-1'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <input
                type='search'
                placeholder='Search size, mill, or product name…'
                value={searchDraft}
                onChange={e => setSearchDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') setSearchTerm(searchDraft)
                }}
                className='w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
              />
            </div>
            <button
              type='button'
              onClick={() => setSearchTerm(searchDraft)}
              className='inline-flex items-center justify-center gap-2 border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            >
              <Search className='h-4 w-4' />
              Search
            </button>
          </div>

          {availableSubcategories.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setSelectedSubcategory('all')}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                  selectedSubcategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                All ({products.length})
              </button>
              {availableSubcategories.map(subcategory => {
                const count = products.filter(
                  p => p.subcategory === subcategory,
                ).length
                return (
                  <button
                    key={subcategory}
                    type='button'
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 ease-out ${
                      selectedSubcategory === subcategory
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {subcategory} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Boards by mill */}
      {filteredProducts.length > 0 ? (
        <div className='space-y-8'>
          {sortedBrands.map(brand => (
            <section key={brand}>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <h3 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  {brand}
                </h3>
                <span className='border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground'>
                  {productsByBrand[brand].length}{' '}
                  {productsByBrand[brand].length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <ProductTable
                products={productsByBrand[brand]}
                onOrder={handleOrder}
                onCalculate={handleCalculate}
                formatPrice={formatUsd}
              />
            </section>
          ))}
        </div>
      ) : (
        <div className='border border-dashed border-border bg-card px-6 py-16 text-center'>
          <Package className='mx-auto mb-3 h-10 w-10 text-muted-foreground' />
          <h3 className='mb-1 text-base font-semibold text-foreground'>
            No matching line items
          </h3>
          <p className='text-sm text-muted-foreground'>
            {selectedSubcategory === 'all' && !searchTerm
              ? `No products in ${category.name} yet.`
              : 'Adjust search or sub-line filters to see more results.'}
          </p>
          {(searchTerm || selectedSubcategory !== 'all') && (
            <button
              type='button'
              onClick={() => {
                setSearchTerm('')
                setSearchDraft('')
                setSelectedSubcategory('all')
              }}
              className='mt-4 text-sm font-medium text-foreground underline-offset-4 hover:underline'
            >
              Clear search & filters
            </button>
          )}
        </div>
      )}

      <WeightCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => {
          setIsCalculatorOpen(false)
          setSelectedProduct(null)
        }}
        productName={selectedProduct?.name}
        productCategory={selectedProduct?.category?.name || category.name}
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
    </>
  )
}
