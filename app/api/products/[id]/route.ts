import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProductPrice } from '@/lib/price-updater'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'
import { productInclude, toProductDTO } from '@/lib/product-dto'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: toProductDTO(product) })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    500,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await params
    const body = await request.json()

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = { ...body }

    // Strip legacy / non-schema fields
    delete updateData.brand
    delete updateData.changeType
    delete updateData.changeAmount
    delete updateData.lastPriceChange
    delete updateData.weight
    delete updateData.specifications
    delete updateData.thickness
    delete updateData.diameter
    delete updateData.grade
    delete updateData.coating
    delete updateData.standard
    delete updateData.length
    delete updateData.subtype
    delete updateData.weightType
    delete updateData.sheetType
    delete updateData.pipeType
    delete updateData.wireType
    delete updateData.height
    delete updateData.meshSize
    delete updateData.packageType

    if (body.weight != null && body.weightKg == null) {
      updateData.weightKg = body.weight
    }
    if (body.specifications != null && body.specs == null) {
      updateData.specs = body.specifications
    }

    if (body.name && body.name !== existingProduct.name) {
      const newSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      const slugConflict = await prisma.product.findFirst({
        where: { slug: newSlug, id: { not: id } },
      })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'Product with this name already exists' },
          { status: 400 },
        )
      }
      updateData.slug = newSlug
    }

    if (body.price !== undefined) {
      const priceUpdateResult = await updateProductPrice(
        id,
        Number(body.price),
        body.priceChangeNote || 'Price update from admin',
      )
      if (!priceUpdateResult.success) {
        return NextResponse.json(
          { success: false, error: priceUpdateResult.error },
          { status: 500 },
        )
      }
      delete updateData.price
      delete updateData.previousPrice
      delete updateData.priceDirection
      delete updateData.priceDelta
      delete updateData.priceUpdatedAt
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    })

    return NextResponse.json({ success: true, data: toProductDTO(product) })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    50,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 },
    )
  }
}
