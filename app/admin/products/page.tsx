import type { Prisma } from '@prisma/client'
import type { ProductDTO } from '@/types/products'

import { Package, PackageCheck, PackageX } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { PageHeader } from '@/components/admin/page-header'
import {
  PAGE_SIZES,
  Pagination,
  pageParams,
} from '@/components/admin/pagination'
import HeaderActions from '@/components/admin/products/header-actions'
import { ProductsWorkspace } from '@/components/admin/products/products-workspace'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { Select } from '@/components/ui/field'
import { prisma } from '@/lib/prisma'

type Dir = Prisma.SortOrder

/** Table columns that sort, and the Prisma order for each. */
const SORTS = {
  name: (dir: Dir) => ({ name: dir }),
  brand: (dir: Dir) => ({ manufacturer: { name: dir } }),
  size: (dir: Dir) => ({ size: dir }),
  price: (dir: Dir) => ({ price: dir }),
  inStock: (dir: Dir) => ({ inStock: dir }),
  category: (dir: Dir) => ({ category: { name: dir } }),
  createdAt: (dir: Dir) => ({ createdAt: dir }),
} satisfies Record<string, (dir: Dir) => Prisma.ProductOrderByWithRelationInput>

const isSort = (value: string): value is keyof typeof SORTS =>
  Object.hasOwn(SORTS, value)

const text = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value.trim() : ''

/** Drop blank values, so the URL only carries what's set. */
const setOnly = (values: Record<string, string>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value))

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = text(params.q)
  const category = text(params.category)
  const stock = text(params.stock)
  const sortParam = text(params.sort)
  const sort = isSort(sortParam) ? sortParam : 'createdAt'
  const dir: Dir = text(params.dir) === 'asc' ? 'asc' : 'desc'
  const { page, limit, skip } = pageParams(params.page, params.limit)

  const search = { contains: query, mode: 'insensitive' } as const
  const where: Prisma.ProductWhereInput = {
    category: category ? { slug: category } : undefined,
    inStock: stock === 'in' ? true : stock === 'out' ? false : undefined,
    OR: query
      ? [
          { name: search },
          { description: search },
          { size: search },
          { manufacturer: { name: search } },
        ]
      : undefined,
  }

  const [rows, total, stockCounts, categories, manufacturers] =
    await Promise.all([
      prisma.product.findMany({
        where,
        // id breaks ties, so equal prices don't swap between pages
        orderBy: [SORTS[sort](dir), { id: 'asc' }],
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
  const sorting: Record<string, string> =
    sort === 'createdAt' && dir === 'desc' ? {} : { sort, dir }

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={
          <HeaderActions
            categories={categories}
            manufacturers={manufacturers}
          />
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

      <DataCard icon={Package} title={`Line items (${total})`}>
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
            params={setOnly({ q: query, category, stock, ...sorting })}
            path='/admin/products'
            total={total}
          />
        ) : null}
      </DataCard>
    </div>
  )
}
