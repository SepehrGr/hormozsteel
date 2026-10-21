import { PriceDirection, Prisma } from '@prisma/client'

function directionFromDelta(delta: Prisma.Decimal): PriceDirection {
  if (delta.gt(0)) return PriceDirection.UP
  if (delta.lt(0)) return PriceDirection.DOWN

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
  if (product.price.equals(newPrice)) return product

  const oldPrice = product.price
  const delta = new Prisma.Decimal(newPrice).minus(oldPrice)
  const direction = directionFromDelta(delta)

  const row = await tx.product.update({
    where: { id: productId },
    data: {
      previousPrice: oldPrice,
      price: newPrice,
      priceDirection: direction,
      priceDelta: delta.abs(),
      priceUpdatedAt: new Date(),
    },
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
  })

  return row
}
