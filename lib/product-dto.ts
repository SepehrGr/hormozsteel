import type { Product, Category, Manufacturer, PriceDirection } from '@prisma/client'

type ProductWithRels = Product & {
  category?: Category | null
  manufacturer?: Manufacturer | null
}

/** Map Prisma product → API JSON (numbers plain, brand denormalized). */
export function toProductDTO(product: ProductWithRels) {
  return {
    ...product,
    brand: product.manufacturer?.name ?? null,
    // Legacy aliases for older UI that still reads changeType
    changeType: mapDirectionToLegacy(product.priceDirection),
    changeAmount: product.priceDelta,
    lastPriceChange: product.priceUpdatedAt,
  }
}

export function mapDirectionToLegacy(direction: PriceDirection | null | undefined) {
  switch (direction) {
    case 'UP':
      return 'increase'
    case 'DOWN':
      return 'decrease'
    default:
      return 'stable'
  }
}

export const productInclude = {
  category: true,
  manufacturer: true,
} as const
