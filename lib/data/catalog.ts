import 'server-only'

import { cache } from 'react'

import { prisma } from '@/lib/prisma'

export const getCategories = cache(() =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  }),
)

export const getCategory = cache((slug: string) =>
  prisma.category.findUnique({ where: { slug } }),
)

/** Every product as a search row for the home page; serialized into its HTML, so keep it lean. */
export const getPriceIndex = cache(async () => {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      subcategory: true,
      category: { select: { slug: true } },
      manufacturer: { select: { name: true } },
    },
  })

  return products.map(product => ({
    id: product.id,
    name: product.name,
    mill: product.manufacturer?.name ?? null,
    price: product.price.toNumber(),
    unit: product.unit,
    categorySlug: product.category.slug,
    subcategory: product.subcategory,
  }))
})

export type PriceIndexRow = Awaited<ReturnType<typeof getPriceIndex>>[number]

/** The lowest unit price per category slug, in that category's most common unit. */
export const getCategoryFloors = cache(async () => {
  const rows = await prisma.product.groupBy({
    by: ['categoryId', 'unit'],
    _min: { price: true },
    _count: true,
  })
  const categories = await getCategories()
  const floors = new Map<
    string,
    { price: number; unit: string; count: number }
  >()

  for (const row of rows) {
    const slug = categories.find(c => c.id === row.categoryId)?.slug
    const current = slug ? floors.get(slug) : undefined

    if (!slug || !row._min.price || (current && current.count >= row._count))
      continue
    floors.set(slug, {
      price: row._min.price.toNumber(),
      unit: row.unit,
      count: row._count,
    })
  }

  return Object.fromEntries(floors)
})

/** Only the columns a pricing board shows: these props are serialized into the page's HTML. */
export const getCategoryProducts = cache(
  async (slug: string, subcategory?: string) => {
    const products = await prisma.product.findMany({
      where: { category: { slug }, subcategory },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        size: true,
        unit: true,
        price: true,
        priceDirection: true,
        priceDelta: true,
        weightKg: true,
        inStock: true,
        images: true,
        subcategory: true,
        categoryId: true,
        manufacturer: { select: { name: true } },
      },
    })

    return products.map(({ manufacturer, price, priceDelta, ...product }) => ({
      ...product,
      price: price.toNumber(),
      priceDelta: priceDelta?.toNumber() ?? null,
      brand: manufacturer?.name ?? null,
    }))
  },
)
