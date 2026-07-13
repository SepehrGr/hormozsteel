'use client'

import React from 'react'
import { useProducts, useCategories } from '@/hooks/useApi'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Spinner } from '@heroui/spinner'

export function ProductsExample() {
  const { products, pagination, isLoading, isError, error } = useProducts({
    page: 1,
    limit: 5,
  })
  const { categories } = useCategories()

  if (isLoading) {
    return (
      <div className='flex justify-center p-8'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='p-8 text-center'>
        <p className='text-red-500'>خطا در بارگذاری محصولات: {error}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-4'>محصولات</h2>

        {/* Categories */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-2'>دسته‌بندی‌ها</h3>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category: any) => (
              <Button key={category.id} variant='bordered' size='sm'>
                {category.name} ({category._count?.products || 0})
              </Button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {products.map((product: any) => (
            <Card key={product.id} className='p-4'>
              <CardBody>
                <div className='space-y-2'>
                  <h4 className='font-semibold'>{product.name}</h4>
                  <p className='text-sm text-gray-600'>{product.description}</p>
                  <div className='flex justify-between items-center'>
                    <span className='text-lg font-bold text-green-600'>
                      {product.price?.toLocaleString()} تومان
                    </span>
                    <span className='text-sm text-gray-500'>
                      {product.unit}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>
                    برند: {product.brand} | دسته: {product.category?.name}
                  </div>
                  <div className='text-xs'>
                    {product.inStock ? (
                      <span className='text-green-500'>موجود</span>
                    ) : (
                      <span className='text-red-500'>ناموجود</span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className='mt-6 text-center text-sm text-gray-600'>
            صفحه {pagination.page} از {pagination.totalPages} | مجموع{' '}
            {pagination.total} محصول
          </div>
        )}
      </div>
    </div>
  )
}
