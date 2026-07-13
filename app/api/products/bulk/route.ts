import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, logAdminAction } from '@/lib/admin-auth'

// Bulk update products
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
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

    // Prepare update data for Product table
    const updates: any = {}
    if (updateData.price !== undefined) updates.price = updateData.price
    if (updateData.inStock !== undefined) updates.inStock = updateData.inStock
    if (updateData.categoryId) updates.categoryId = updateData.categoryId

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 },
      )
    }

    // If price is being changed, record price history entries
    if (updateData.price !== undefined) {
      const currentProducts = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
          price: true,
        },
      })

      const now = new Date()
      const historyData = currentProducts
        .filter((p) => p.price !== updateData.price)
        .map((p) => {
          const oldPrice = p.price
          const newPrice = updateData.price as number
          const diff = newPrice - oldPrice
          let changeType = 'ثابت'
          if (diff > 0) changeType = 'افزایش'
          else if (diff < 0) changeType = 'کاهش'

          return {
            productId: p.id,
            oldPrice,
            newPrice,
            changeType,
            changeAmount: Math.abs(diff),
            changedAt: now,
          }
        })

      if (historyData.length > 0) {
        await prisma.priceHistory.createMany({
          data: historyData,
        })
      }
    }

    // Add updated timestamp
    updates.updatedAt = new Date()

    // Perform bulk update for products
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: updates,
    })

    // Log admin action
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
    const session = await requireAuth()
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 },
      )
    }

    // Get product details before deletion for logging
    const productsToDelete = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        brand: true,
      },
    })

    // Delete the products
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      'BULK_DELETE',
      'PRODUCT',
      undefined,
      {
        productIds,
        deletedProducts: productsToDelete,
        affectedCount: result.count,
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} products`,
      affectedCount: result.count,
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 },
    )
  }
}
