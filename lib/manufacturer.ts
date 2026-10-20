import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slug'

/**
 * Resolve mill from manufacturerId and/or free-text brand name.
 * Creates a manufacturer when brand is new (admin add/edit flows).
 */
export async function resolveManufacturerId(
  opts: {
    manufacturerId?: string | null
    brand?: string | null
  },
  db: Prisma.TransactionClient = prisma,
): Promise<string | null> {
  const { manufacturerId, brand } = opts

  if (manufacturerId) {
    const byId = await db.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { id: true },
    })

    if (byId) return byId.id
  }

  const name = typeof brand === 'string' ? brand.trim() : ''

  if (!name) return null

  const existing = await db.manufacturer.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  })

  if (existing) return existing.id

  let slug = slugify(name) || `mill-${Date.now()}`
  const slugTaken = await db.manufacturer.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`

  const created = await db.manufacturer.create({
    data: { name, slug },
    select: { id: true },
  })

  return created.id
}
