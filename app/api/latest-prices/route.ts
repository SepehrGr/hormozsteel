import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { mapDirectionToLegacy } from '@/lib/product-dto'
import { resolveCategoryIcon } from '@/config/category-icons'

export async function GET() {
  try {
    const recentPriceChanges = await prisma.priceHistory.findMany({
      orderBy: { changedAt: 'desc' },
      take: 50,
      select: {
        productId: true,
        newPrice: true,
        changedAt: true,
        direction: true,
        delta: true,
      },
    })

    const uniqueProductIds = Array.from(
      new Set(recentPriceChanges.map(c => c.productId)),
    ).slice(0, 12)

    // Fall back to latest products if little history
    const products =
      uniqueProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: uniqueProductIds } },
            include: {
              category: { select: { name: true, icon: true, slug: true } },
              manufacturer: { select: { name: true } },
            },
          })
        : await prisma.product.findMany({
            take: 12,
            orderBy: { updatedAt: 'desc' },
            include: {
              category: { select: { name: true, icon: true, slug: true } },
              manufacturer: { select: { name: true } },
            },
          })

    const priceChangesMap = new Map<
      string,
      (typeof recentPriceChanges)[number]
    >()

    for (const change of recentPriceChanges) {
      if (!priceChangesMap.has(change.productId)) {
        priceChangesMap.set(change.productId, change)
      }
    }

    const formattedProducts = products.map(product => {
      const priceChange = priceChangesMap.get(product.id)
      const specs = (product.specs as Record<string, string> | null) ?? {}

      return {
        id: product.id,
        name: product.name,
        brand: product.manufacturer?.name || '',
        category: product.category?.name || 'Other',
        categorySlug: product.category?.slug || '',
        categoryIcon: resolveCategoryIcon(
          product.category?.icon ||
            product.category?.slug ||
            product.category?.name,
        ),
        subcategory: product.subcategory || '',
        size: product.size || '',
        grade: specs.grade || '',
        price: product.price,
        unit: product.unit || 'KG',
        inStock: product.inStock,
        image:
          product.images && product.images.length > 0 ? product.images[0] : '',
        description: product.description || '',
        specifications: specs,
        lastUpdated: product.updatedAt.toISOString(),
        priceHistory: priceChange
          ? {
              changeType: mapDirectionToLegacy(priceChange.direction),
              changeAmount: priceChange.delta,
              changedAt: priceChange.changedAt.toISOString(),
            }
          : product.priceDirection
            ? {
                changeType: mapDirectionToLegacy(product.priceDirection),
                changeAmount: product.priceDelta ?? 0,
                changedAt: (
                  product.priceUpdatedAt ?? product.updatedAt
                ).toISOString(),
              }
            : null,
      }
    })

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    })
  } catch (error) {
    console.error('Error fetching latest prices:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch latest prices' },
      { status: 500 },
    )
  }
}
