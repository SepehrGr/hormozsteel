import { PriceDirection, Prisma } from '@prisma/client'

function directionFromDelta(delta: Prisma.Decimal): PriceDirection {
  if (delta.gt(0)) return PriceDirection.UP
  if (delta.lt(0)) return PriceDirection.DOWN

  return PriceDirection.STABLE
}

/**
 * Set a product's price inside the caller's transaction, keeping
 * its last-move fields in step and appending a price-history row.
 * Does nothing when the price is unchanged.
 */
export async function setProductPrice(
  tx: Prisma.TransactionClient,
  productId: string,
  newPrice: number,
  note?: string,
) {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { price: true },
  })

  if (!product) {
    throw new Error(`Product not found: ${productId}`)
  }
  if (product.price.equals(newPrice)) return

  const oldPrice = product.price
  const delta = new Prisma.Decimal(newPrice).minus(oldPrice)
  const direction = directionFromDelta(delta)

  await tx.product.update({
    where: { id: productId },
    data: {
      price: newPrice,
      priceDirection: direction,
      priceDelta: delta.abs(),
      priceUpdatedAt: new Date(),
    },
    select: { id: true },
  })

  await tx.priceHistory.create({
    data: {
      productId,
      oldPrice,
      newPrice,
      direction,
      delta: delta.abs(),
      note,
    },
    select: { id: true },
  })
}
