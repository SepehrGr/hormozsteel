import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/categories/[id] - Get a single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        products: includeProducts
          ? {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                inStock: true,
                brand: true,
                subcategory: true,
              },
              orderBy: {
                name: 'asc',
              },
            }
          : false,
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
      },
      { status: 500 },
    )
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 50, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      )
    }

    // If name is being updated, regenerate slug
    let updateData = { ...body }
    if (body.name && body.name !== existingCategory.name) {
      const newSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
        .replace(/\s+/g, '-')
        .trim()

      // Check if new slug conflicts with existing categories (excluding current)
      const slugConflict = await prisma.productCategory.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category with this name already exists',
          },
          { status: 400 },
        )
      }

      updateData.slug = newSlug
    }

    // Update the category
    const category = await prisma.productCategory.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 30, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { id } = await params

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      )
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category that has products',
        },
        { status: 400 },
      )
    }

    // Delete the category
    await prisma.productCategory.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
      },
      { status: 500 },
    )
  }
}
