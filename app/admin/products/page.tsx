import type { ProductDTO } from '@/types/products'

import { Download, Package, PackageCheck, PackageX } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { PageHeader } from '@/components/admin/page-header'
import {
  PAGE_SIZES,
  Pagination,
  pageParams,
} from '@/components/admin/pagination'
import { createProduct } from '@/app/admin/products/actions'
import { ImportExcelButton } from '@/components/admin/products/import-excel-button'
import { ProductFormDialog } from '@/components/admin/products/product-form-dialog'
import { ProductsWorkspace } from '@/components/admin/products/products-workspace'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { Button } from '@/components/ui/button'
import { DialogButton } from '@/components/ui/dialog-button'
import { Select } from '@/components/ui/field'
import { productFilters, setOnly } from '@/lib/product-filters'
import { prisma } from '@/lib/prisma'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const {
    query,
    category,
    stock,
    sort,
    dir,
    sorting,
    where,
    orderBy,
    params: filterParams,
  } = productFilters(params)
  const { page, limit, skip } = pageParams(params.page, params.limit)
  const exportHref = `/api/products/export?${new URLSearchParams(filterParams)}`

  const [rows, total, stockCounts, categories, manufacturers] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          size: true,
          unit: true,
          price: true,
          inStock: true,
          images: true,
          subcategory: true,
          weightKg: true,
          categoryId: true,
          manufacturerId: true,
          category: { select: { id: true, name: true } },
          manufacturer: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({ by: ['inStock'], _count: true }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true, subcategories: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.manufacturer.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ])

  const products: ProductDTO[] = rows.map(row => ({
    ...row,
    brand: row.manufacturer?.name ?? null,
  }))
  const countOf = (inStock: boolean) =>
    stockCounts.find(row => row.inStock === inStock)?._count ?? 0
  const filtered = Boolean(query || category || stock)

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={
          <>
            <ImportExcelButton categories={categories} />
            <Button asChild variant='outline'>
              {/* A plain link: the browser downloads the file the route sends */}
              <a download href={exportHref}>
                <Download aria-hidden className='h-4 w-4' />
                Export Excel
              </a>
            </Button>
            <DialogButton label='Add product'>
              <ProductFormDialog
                action={createProduct}
                categories={categories}
                manufacturers={manufacturers}
                mode='create'
              />
            </DialogButton>
          </>
        }
        description='View, edit, and manage catalog line items.'
        icon={Package}
        title='Products'
      />

      <StatsBoard
        stats={[
          {
            label: 'Products',
            value: countOf(true) + countOf(false),
            icon: Package,
          },
          { label: 'In stock', value: countOf(true), icon: PackageCheck },
          { label: 'Out of stock', value: countOf(false), icon: PackageX },
        ]}
      />

      <SearchToolbar
        filtered={Boolean(category || stock)}
        params={setOnly({
          ...sorting,
          limit: limit === PAGE_SIZES[0] ? '' : String(limit),
        })}
        path='/admin/products'
        placeholder='Search name, size, or mill…'
        query={query}
      >
        {/* keys reset the uncontrolled selects when the URL changes */}
        <Select
          key={`category-${category}`}
          aria-label='Category'
          className='sm:w-48'
          defaultValue={category}
          name='category'
        >
          <option value=''>All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          key={`stock-${stock}`}
          aria-label='Stock'
          className='sm:w-40'
          defaultValue={stock}
          name='stock'
        >
          <option value=''>All stock</option>
          <option value='in'>In stock</option>
          <option value='out'>Out of stock</option>
        </Select>
      </SearchToolbar>

      <DataCard titleHidden title={`Line items (${total})`}>
        {products.length > 0 ? (
          <ProductsWorkspace
            // A new page or filter starts with nothing selected
            key={[query, category, stock, sort, dir, page, limit].join('|')}
            categories={categories}
            dir={dir}
            manufacturers={manufacturers}
            products={products}
            sort={sort}
          />
        ) : (
          <EmptyState
            description={
              filtered
                ? 'Try a different search or filter.'
                : 'Add the first product to start the catalog.'
            }
            icon={Package}
            title={
              filtered ? 'No products match these filters' : 'No products yet'
            }
          />
        )}
        {total > 0 ? (
          <Pagination
            limit={limit}
            page={page}
            params={filterParams}
            path='/admin/products'
            total={total}
          />
        ) : null}
      </DataCard>
    </div>
  )
}
