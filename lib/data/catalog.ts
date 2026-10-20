import 'server-only'

import { cache } from 'react'

import { prisma } from '@/lib/prisma'
import { productInclude, toProductDTO } from '@/lib/product-dto'

export const getCategories = cache(() =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  }),
)

export const getCategory = cache((slug: string) =>
  prisma.category.findUnique({ where: { slug } }),
)

export const getCategoryProducts = cache(
  async (slug: string, subcategory?: string) => {
    const products = await prisma.product.findMany({
      where: { category: { slug }, subcategory },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })

    return products.map(toProductDTO)
  },
)

export const getManufacturers = cache(() =>
  prisma.manufacturer.findMany({ orderBy: { name: 'asc' } }),
)

export const getManufacturer = cache((slug: string) =>
  prisma.manufacturer.findUnique({ where: { slug } }),
)
