import { PriceDirection, type Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

function directionFromDelta(delta: number): PriceDirection {
  if (delta > 0) return PriceDirection.UP
  if (delta < 0) return PriceDirection.DOWN

  return PriceDirection.STABLE
}

/**
 * Set a product's price inside the caller's transaction, keeping
 * `previousPrice`/`priceDirection` in step and appending a price-history row.
 * Does nothing when the price is unchanged.
 */
export async function setProductPrice(
  tx: Prisma.TransactionClient,
  productId: string,
  newPrice: number,
  note?: string,
) {
  const product = await tx.product.findUnique({ where: { id: productId } })

  if (!product) {
    throw new Error(`Product not found: ${productId}`)
  }
  if (product.price === newPrice) return product

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
      priceUpdatedAt: new Date(),
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
}

/** `setProductPrice` in a transaction of its own, for callers outside one. */
export async function updateProductPrice(
  productId: string,
  newPrice: number,
  note?: string,
): Promise<
  { success: true; data: unknown } | { success: false; error: string }
> {
  try {
    const updated = await prisma.$transaction(tx =>
      setProductPrice(tx, productId, newPrice, note),
    )

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
