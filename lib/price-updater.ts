import { PriceDirection } from '@prisma/client'

import { prisma } from '@/lib/prisma'

function directionFromDelta(delta: number): PriceDirection {
  if (delta > 0) return PriceDirection.UP
  if (delta < 0) return PriceDirection.DOWN

  return PriceDirection.STABLE
}

/**
 * Update a product's price and append a price-history row.
 */
export async function updateProductPrice(
  productId: string,
  newPrice: number,
  note?: string,
): Promise<
  { success: true; data: unknown } | { success: false; error: string }
> {
  try {
    const updated = await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({ where: { id: productId } })

      if (!product) {
        throw new Error(`Product not found: ${productId}`)
      }

      const oldPrice = product.price
      const delta = newPrice - oldPrice
      const direction = directionFromDelta(delta)

      const row = await tx.product.update({
        where: { id: productId },
        data: {
          previousPrice: oldPrice,
          price: newPrice,
          priceDirection: direction,
          priceDelta: Math.abs(delta),
          priceUpdatedAt:
            direction === PriceDirection.STABLE
              ? product.priceUpdatedAt
              : new Date(),
        },
      })

      await tx.priceHistory.create({
        data: {
          productId,
          oldPrice,
          newPrice,
          direction,
          delta: Math.abs(delta),
          note,
        },
      })

      return row
    })

    return { success: true, data: updated }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to update price',
    }
  }
}

export async function getRecentPriceChanges(limit = 20) {
  return prisma.priceHistory.findMany({
    take: limit,
    orderBy: { changedAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          size: true,
          price: true,
          manufacturer: { select: { name: true } },
        },
      },
    },
  })
}
