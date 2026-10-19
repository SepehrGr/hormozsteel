import type { Prisma } from '@prisma/client'

type Dir = Prisma.SortOrder
type SearchParams = Record<string, string | string[] | undefined>

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
export const setOnly = (values: Record<string, string>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value))

/**
 * The admin product list's filters (`?q`, `?category`, `?stock`, `?sort`,
 * `?dir`) as a Prisma query. The page and the Excel export both read them
 * here, so an export is always exactly what the page shows.
 */
export function productFilters(params: SearchParams) {
  const query = text(params.q)
  const category = text(params.category)
  const stock = text(params.stock)
  const sortParam = text(params.sort)
  const sort = isSort(sortParam) ? sortParam : 'createdAt'
  const dir: Dir = text(params.dir) === 'asc' ? 'asc' : 'desc'
  const sorting: Record<string, string> =
    sort === 'createdAt' && dir === 'desc' ? {} : { sort, dir }

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

  return {
    query,
    category,
    stock,
    sort,
    dir,
    sorting,
    where,
    // id breaks ties, so equal prices don't swap between pages
    orderBy: [
      SORTS[sort](dir),
      { id: 'asc' },
    ] satisfies Prisma.ProductOrderByWithRelationInput[],
    /** The set filters and sort as search params, for links that keep them. */
    params: setOnly({ q: query, category, stock, ...sorting }),
  }
}
