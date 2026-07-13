'use client'

import React, { useState, useMemo, useEffect } from 'react'
import CategoryTable from '@/components/category-table'
import { Product, ProductCategory } from '@/types/products'
import { Switch } from '@heroui/switch'
import { Search, Filter } from 'lucide-react'

interface CategoryProductsProps {
  category: ProductCategory
}

export default function CategoryProducts({ category }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State برای فیلتر نوع محصول
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')

  // Search and VAT
  const [searchTerm, setSearchTerm] = useState('')
  // searchDraft holds the typed value until user clicks Search
  const [searchDraft, setSearchDraft] = useState('')
  const [includeVAT, setIncludeVAT] = useState(false)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const url = `/api/products?category=${category.id}&limit=1000`
        console.log('🔍 CategoryProducts: Fetching from URL:', url)
        console.log('🔍 CategoryProducts: Category ID:', category.id)

        const response = await fetch(url)
        const data = await response.json()

        console.log('✅ CategoryProducts: API Response:', data)
        console.log(
          '✅ CategoryProducts: Products count:',
          data.success ? data.data.products.length : 0,
        )

        if (data.success) {
          setProducts(data.data.products)
        } else {
          setError(data.error || 'خطا در دریافت محصولات')
        }
      } catch (err) {
        console.error('❌ Error fetching products:', err)
        setError('خطا در دریافت محصولات')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category.id])

  // فیلتر کردن محصولات بر اساس subcategory انتخاب شده
  const filteredProducts = useMemo(() => {
    let list = products

    if (selectedSubcategory !== 'all') {
      list = list.filter(product => product.subcategory === selectedSubcategory)
    }

    if (searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter(product => {
        return (
          (product.name || '').toLowerCase().includes(q) ||
          (product.description || '').toLowerCase().includes(q)
        )
      })
    }

    return list
  }, [products, selectedSubcategory, searchTerm])

  // دریافت لیست subcategories موجود در محصولات
  const availableSubcategories = useMemo(() => {
    const subcategories = Array.from(
      new Set(products.map(product => product.subcategory)),
    )
    return subcategories.sort()
  }, [products])

  // گروه‌بندی محصولات فیلتر شده بر اساس برند
  const productsByBrand = filteredProducts.reduce(
    (acc, product) => {
      const brand = product.brand
      if (!acc[brand]) {
        acc[brand] = []
      }
      acc[brand].push(product)
      return acc
    },
    {} as Record<string, Product[]>,
  )

  // مرتب کردن برندها بر اساس الفبا
  const sortedBrands = Object.keys(productsByBrand).sort()

  // تابع برای مدیریت سفارش محصول
  const handleOrder = (product: Product) => {
    // TODO: پیاده‌سازی منطق سفارش
    console.log('سفارش محصول:', product.name)
  }

  // تابع برای محاسبه وزن
  const handleCalculate = (product: Product) => {
    // TODO: پیاده‌سازی منطق محاسبه
    console.log('محاسبه وزن برای:', product.name)
  }

  // محاسبه و فرمت قیمت با/بدون ارزش افزوده
  const calculatePrice = (basePrice: number) => {
    return includeVAT ? basePrice * 1.1 : basePrice
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(
      Math.round(calculatePrice(price)),
    )
  }

  return (
    <>
      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin'></div>
            <p className='text-slate-600 dark:text-slate-400'>
              در حال بارگذاری محصولات...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className='py-16 text-center'>
          <div className='flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full dark:bg-red-900/20'>
            <svg
              className='w-12 h-12 text-red-600 dark:text-red-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <h3 className='mb-2 text-2xl font-semibold text-slate-700 dark:text-slate-300'>
            خطا در دریافت اطلاعات
          </h3>
          <p className='max-w-md mx-auto text-slate-500 dark:text-slate-400'>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Search + Filter Bar */}
          <div className='p-3 mb-6 dark:border-slate-700'>
            <div className='mb-3'>
              <h3 className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                جستجو و فیلترها
              </h3>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute w-4 h-4 transform -translate-y-1/2 right-3 top-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='جستجو در محصولات...'
                    value={searchDraft}
                    onChange={e => setSearchDraft(e.target.value)}
                    className='w-full px-3 py-2 pl-4 pr-10 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white'
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setSearchTerm(searchDraft)}
                  className='flex items-center gap-2 px-3 py-2 transition-colors bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                >
                  <Search className='w-4 h-4 text-slate-700 dark:text-slate-300' />
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    جستجو
                  </span>
                </button>

                <div
                  className='flex items-center gap-2 px-3 py-2 transition-colors bg-white border rounded-lg cursor-pointer dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                  onClick={() => setIncludeVAT(!includeVAT)}
                >
                  <div className='flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300'>
                    <Switch
                      isSelected={includeVAT}
                      onValueChange={setIncludeVAT}
                      size='sm'
                      color='primary'
                      className='rotate-180'
                      classNames={{
                        wrapper: 'group-data-[selected=true]:bg-blue-500',
                      }}
                    />
                    <span>احتساب ارزش افزوده</span>
                  </div>
                </div>
              </div>
            </div>

            {/* فیلتر نوع محصول */}
            <div className='mt-3'>
              {availableSubcategories.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    همه ({products.length})
                  </button>
                  {availableSubcategories.map(subcategory => {
                    const count = products.filter(
                      p => p.subcategory === subcategory,
                    ).length
                    return (
                      <button
                        key={subcategory}
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          selectedSubcategory === subcategory
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
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

          {/* Content Section */}
          <div>
            {filteredProducts.length > 0 ? (
              <div className='space-y-12'>
                {sortedBrands.map(brand => (
                  <div key={brand} className='space-y-6'>
                    <div className='flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-center w-12 h-12 text-lg font-bold text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl'>
                          {brand.charAt(0)}
                        </div>
                        <div>
                          <h2 className='text-2xl font-bold text-slate-800 dark:text-white'>
                            {brand}
                          </h2>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>
                            {productsByBrand[brand].length} محصول موجود
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700'>
                      <CategoryTable
                        category={category}
                        products={productsByBrand[brand]}
                        onOrder={handleOrder}
                        onCalculate={handleCalculate}
                        formatPrice={formatPrice}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-16 text-center'>
                <div className='flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800'>
                  <div className='text-4xl text-slate-400'>{category.icon}</div>
                </div>
                <h3 className='mb-2 text-2xl font-semibold text-slate-700 dark:text-slate-300'>
                  محصولی یافت نشد
                </h3>
                <p className='max-w-md mx-auto text-slate-500 dark:text-slate-400'>
                  {selectedSubcategory === 'all'
                    ? `در حال حاضر محصولی در دسته‌بندی ${category.name} موجود نیست.`
                    : `محصولی از نوع "${selectedSubcategory}" در دسته‌بندی ${category.name} یافت نشد.`}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
