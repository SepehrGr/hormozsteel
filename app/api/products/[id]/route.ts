import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProductPrice } from '@/lib/price-updater'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check rate limit
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 },
    )
  }
}

// PATCH /api/products/[id] - Update a product (partial update)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Check rate limit (stricter for write operations)
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 500, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 },
      )
    }

    // If name is being updated, regenerate slug
    let updateData = { ...body }
    if (body.name && body.name !== existingProduct.name) {
      const newSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
        .replace(/\s+/g, '-')
        .trim()

      // Check if new slug conflicts with existing products (excluding current)
      const slugConflict = await prisma.product.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: 'Product with this name already exists',
          },
          { status: 400 },
        )
      }

      updateData.slug = newSlug
    }

    // اگر قیمت در request موجود است، در تاریخچه ثبت کن (حتی اگر تغییر نکرده باشد)
    if (body.price !== undefined) {
      const priceUpdateResult = await updateProductPrice(
        id,
        body.price,
        body.priceChangeNote || 'تغییر قیمت از پنل ادمین',
      )

      if (!priceUpdateResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: priceUpdateResult.error,
          },
          { status: 500 },
        )
      }

      // قیمت از طریق updateProductPrice آپدیت شد، پس از updateData حذفش می‌کنیم
      delete updateData.price
      delete updateData.previousPrice
      delete updateData.changeType
      delete updateData.changeAmount
      delete updateData.lastPriceChange
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
      },
      { status: 500 },
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Check rate limit (stricter for write operations)
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 500, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 },
      )
    }

    // If name is being updated, regenerate slug
    let updateData = { ...body }
    if (body.name && body.name !== existingProduct.name) {
      const newSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
        .replace(/\s+/g, '-')
        .trim()

      // Check if new slug conflicts with existing products (excluding current)
      const slugConflict = await prisma.product.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: 'Product with this name already exists',
          },
          { status: 400 },
        )
      }

      updateData.slug = newSlug
    }

    // اگر قیمت در request موجود است، در تاریخچه ثبت کن (حتی اگر تغییر نکرده باشد)
    if (body.price !== undefined) {
      const priceUpdateResult = await updateProductPrice(
        id,
        body.price,
        body.priceChangeNote || 'تغییر قیمت از پنل ادمین',
      )

      if (!priceUpdateResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: priceUpdateResult.error,
          },
          { status: 500 },
        )
      }

      // قیمت از طریق updateProductPrice آپدیت شد، پس از updateData حذفش می‌کنیم
      delete updateData.price
      delete updateData.previousPrice
      delete updateData.changeType
      delete updateData.changeAmount
      delete updateData.lastPriceChange
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check rate limit (stricter for write operations)
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 500, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 },
      )
    }

    // Check if product has any order items
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id },
    })

    if (orderItems) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete product that has been ordered',
        },
        { status: 400 },
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
      },
      { status: 500 },
    )
  }
}
