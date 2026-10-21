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
  const recentChanges = await prisma.priceHistory.findMany({
    orderBy: { changedAt: 'desc' },
    take: 50,
    select: { productId: true, changedAt: true, direction: true, delta: true },
  })

  const latestChange = new Map<string, (typeof recentChanges)[number]>()

  for (const change of recentChanges) {
    if (!latestChange.has(change.productId)) {
      latestChange.set(change.productId, change)
    }
  }

  const ids = [...latestChange.keys()].slice(0, 12)

  // Fall back to latest products if little history
  const products =
    ids.length > 0
      ? (
          await prisma.product.findMany({
            where: { id: { in: ids } },
            select: productSelect,
          })
        ).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
      : await prisma.product.findMany({
          take: 12,
          orderBy: { updatedAt: 'desc' },
          select: productSelect,
        })

  return products.map(product => {
    const change = latestChange.get(product.id)

    return {
      id: product.id,
      name: product.name,
      brand: product.manufacturer?.name ?? null,
      categorySlug: product.category?.slug ?? null,
      subcategory: product.subcategory,
      price: product.price.toNumber(),
      unit: product.unit,
      direction: change?.direction ?? product.priceDirection,
      delta: (change?.delta ?? product.priceDelta)?.toNumber() ?? null,
      // Formatted here, in the server's time zone: client-side it would differ per
      // visitor and break hydration
      updated: formatShortDateTime(
        change?.changedAt ?? product.priceUpdatedAt ?? product.updatedAt,
      ),
    }
  })
})

export type LatestPrice = Awaited<ReturnType<typeof getLatestPrices>>[number]
