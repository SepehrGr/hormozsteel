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

    return products.map(({ manufacturer, ...product }) => ({
      ...product,
      brand: manufacturer?.name ?? null,
    }))
  },
)

export const getManufacturers = cache(() =>
  prisma.manufacturer.findMany({ orderBy: { name: 'asc' } }),
)

export const getManufacturer = cache((slug: string) =>
  prisma.manufacturer.findUnique({ where: { slug } }),
)
