'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

import { chipClass } from '@/components/products/advanced-filters'
import { NoMatches, ProductBoards } from '@/components/products/product-boards'
import { Product, ProductCategory } from '@/types/products'
import { matchesSearch } from '@/lib/utils'

interface CategoryProductsProps {
  category: ProductCategory
  products: Product[]
}

export default function CategoryProducts({
  category,
  products,
}: CategoryProductsProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDraft, setSearchDraft] = useState('')

  const filteredProducts = products.filter(
    product =>
      (selectedSubcategory === 'all' ||
        product.subcategory === selectedSubcategory) &&
      matchesSearch(searchTerm, [
        product.name,
        product.brand,
        product.size,
        product.description,
      ]),
  )

  const subcategories = [
    ...new Set(products.map(p => p.subcategory).filter(Boolean)),
  ].sort() as string[]

  const filtered = searchTerm !== '' || selectedSubcategory !== 'all'

  const clear = () => {
    setSearchTerm('')
    setSearchDraft('')
    setSelectedSubcategory('all')
  }

  return (
    <>
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
                aria-label='Search products'
                className='w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
                placeholder='Search size, mill, or product name…'
                type='search'
                value={searchDraft}
                onChange={e => setSearchDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') setSearchTerm(searchDraft)
                }}
              />
            </div>
            <button
              className='inline-flex items-center justify-center gap-2 border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
              type='button'
              onClick={() => setSearchTerm(searchDraft)}
            >
              <Search className='h-4 w-4' />
              Search
            </button>
          </div>

          {subcategories.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              <button
                aria-pressed={selectedSubcategory === 'all'}
                className={chipClass(selectedSubcategory === 'all')}
                type='button'
                onClick={() => setSelectedSubcategory('all')}
              >
                All ({products.length})
              </button>
              {subcategories.map(subcategory => (
                <button
                  key={subcategory}
                  aria-pressed={selectedSubcategory === subcategory}
                  className={chipClass(selectedSubcategory === subcategory)}
                  type='button'
                  onClick={() => setSelectedSubcategory(subcategory)}
                >
                  {subcategory} (
                  {products.filter(p => p.subcategory === subcategory).length})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <ProductBoards
          categoryName={category.name}
          products={filteredProducts}
        />
      ) : (
        <NoMatches
          message={
            filtered
              ? 'Adjust search or sub-line filters to see more results.'
              : `No products in ${category.name} yet.`
          }
          onClear={filtered ? clear : undefined}
        />
      )}
    </>
  )
}
