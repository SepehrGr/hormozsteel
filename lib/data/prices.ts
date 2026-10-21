import 'server-only'

import { cache } from 'react'

import { prisma } from '@/lib/prisma'
import { formatShortDateTime } from '@/lib/format'

const productSelect = {
  id: true,
  name: true,
  subcategory: true,
  price: true,
  unit: true,
  priceDirection: true,
  priceDelta: true,
  priceUpdatedAt: true,
  updatedAt: true,
  category: { select: { slug: true } },
  manufacturer: { select: { name: true } },
} as const

/** Up to 12 products with the latest price moves, newest move first. */
export const getLatestPrices = cache(async () => {
  const moved = await prisma.product.findMany({
    where: { priceDirection: { not: 'STABLE' } },
    orderBy: { priceUpdatedAt: { sort: 'desc', nulls: 'last' } },
    take: 12,
    select: productSelect,
  })
  // Until a price has moved, show the newest products
  const products =
    moved.length > 0
      ? moved
      : await prisma.product.findMany({
          take: 12,
          orderBy: { updatedAt: 'desc' },
          select: productSelect,
        })

  return products.map(product => ({
    id: product.id,
    name: product.name,
    brand: product.manufacturer?.name ?? null,
    categorySlug: product.category?.slug ?? null,
    subcategory: product.subcategory,
    price: product.price.toNumber(),
    unit: product.unit,
    direction: product.priceDirection,
    delta: product.priceDelta?.toNumber() ?? null,
    // Formatted here, in the server's time zone: client-side it would differ per
    // visitor and break hydration
    updated: formatShortDateTime(product.priceUpdatedAt ?? product.updatedAt),
  }))
})

export type LatestPrice = Awaited<ReturnType<typeof getLatestPrices>>[number]
