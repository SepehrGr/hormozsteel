import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const categories = await prisma.productCategory.findMany({
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
              },
            }
          : false,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 },
    )
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request, 50, 15 * 60 * 1000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
        },
        { status: 400 },
      )
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category with this name already exists',
        },
        { status: 400 },
      )
    }

    // Create the category
    const category = await prisma.productCategory.create({
      data: {
        ...body,
        slug,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
      },
      { status: 500 },
    )
  }
}
