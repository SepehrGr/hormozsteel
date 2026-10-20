import { PriceDirection, type Prisma } from '@prisma/client'

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
