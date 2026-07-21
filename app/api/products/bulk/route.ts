import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, logAdminAction } from '@/lib/admin-auth'
import { PriceDirection } from '@prisma/client'

async function requireApiAuth() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      ),
    }
  }
  return { session }
}

// Bulk update products
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireApiAuth()
    if ('error' in auth && auth.error) return auth.error
    const session = auth.session!

    const body = await request.json()
    const { productIds, updateData } = body as {
      productIds?: string[]
      updateData?: {
        price?: number
        inStock?: boolean
        categoryId?: string
      }
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs array is required' },
        { status: 400 },
      )
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No update data provided' },
        { status: 400 },
      )
    }

    const updates: {
      price?: number
      inStock?: boolean
      categoryId?: string
      previousPrice?: number
      priceDirection?: PriceDirection
      priceDelta?: number
      priceUpdatedAt?: Date
      updatedAt?: Date
    } = {}

    if (updateData.price !== undefined) updates.price = updateData.price
    if (updateData.inStock !== undefined) updates.inStock = updateData.inStock
    if (updateData.categoryId) updates.categoryId = updateData.categoryId

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 },
      )
    }

    // Price history uses current schema fields (direction / delta)
    if (updateData.price !== undefined) {
      const currentProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      })

      const now = new Date()
      const historyData = currentProducts
        .filter(p => p.price !== updateData.price)
        .map(p => {
          const oldPrice = p.price
          const newPrice = updateData.price as number
          const diff = newPrice - oldPrice
          let direction: PriceDirection = PriceDirection.STABLE
          if (diff > 0) direction = PriceDirection.UP
          else if (diff < 0) direction = PriceDirection.DOWN

          return {
            productId: p.id,
            oldPrice,
            newPrice,
            direction,
            delta: Math.abs(diff),
            changedAt: now,
          }
        })

      if (historyData.length > 0) {
        await prisma.priceHistory.createMany({ data: historyData })
      }

      updates.priceUpdatedAt = now
      // Per-product previousPrice/direction need individual updates; leave to single-product path
    }

    updates.updatedAt = new Date()

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: updates,
    })

    await logAdminAction(
      session.user.id,
      'BULK_UPDATE',
      'PRODUCT',
      undefined,
      {
        productIds,
        updateData,
        affectedCount: result.count,
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} products`,
      affectedCount: result.count,
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update products' },
      { status: 500 },
    )
  }
}

// Bulk delete products
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiAuth()
    if ('error' in auth && auth.error) return auth.error
    const session = auth.session!

    let body: { productIds?: string[] }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs array is required' },
        { status: 400 },
      )
    }

    // Snapshot for audit log — only fields that exist on Product
    const productsToDelete = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        size: true,
      },
    })

    if (productsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No matching products found' },
        { status: 404 },
      )
    }

    const ids = productsToDelete.map(p => p.id)

    // Explicit cleanup is safe even with onDelete: Cascade
    await prisma.$transaction([
      prisma.priceHistory.deleteMany({ where: { productId: { in: ids } } }),
      prisma.orderItem.deleteMany({ where: { productId: { in: ids } } }),
      prisma.product.deleteMany({ where: { id: { in: ids } } }),
    ])

    await logAdminAction(
      session.user.id,
      'BULK_DELETE',
      'PRODUCT',
      undefined,
      {
        productIds: ids,
        deletedProducts: productsToDelete,
        affectedCount: productsToDelete.length,
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${productsToDelete.length} products`,
      affectedCount: productsToDelete.length,
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete products',
      },
      { status: 500 },
    )
  }
}
