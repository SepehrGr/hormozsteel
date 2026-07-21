import type { Product, Category, Manufacturer, PriceDirection } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

/**
 * Resolve mill from manufacturerId and/or free-text brand name.
 * Creates a manufacturer when brand is new (admin add/edit flows).
 */
export async function resolveManufacturerId(opts: {
  manufacturerId?: string | null
  brand?: string | null
}): Promise<string | null> {
  const { manufacturerId, brand } = opts

  if (manufacturerId) {
    const byId = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { id: true },
    })
    if (byId) return byId.id
  }

  const name = typeof brand === 'string' ? brand.trim() : ''
  if (!name) return null

  const existing = await prisma.manufacturer.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existing) return existing.id

  let slug = slugifyName(name) || `mill-${Date.now()}`
  const slugTaken = await prisma.manufacturer.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`

  const created = await prisma.manufacturer.create({
    data: { name, slug },
    select: { id: true },
  })
  return created.id
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
