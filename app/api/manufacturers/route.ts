import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

// GET /api/manufacturers - Get all manufacturers
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get manufacturers
    const [manufacturers, total] = await Promise.all([
      prisma.manufacturer.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.manufacturer.count({ where }),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        manufacturers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch manufacturers',
      },
      { status: 500 }
    )
  }
}

// POST /api/manufacturers - Create a new manufacturer
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
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists
    const existingManufacturer = await prisma.manufacturer.findUnique({
      where: { slug },
    })

    if (existingManufacturer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manufacturer with this name already exists',
        },
        { status: 400 }
      )
    }

    // Create the manufacturer
    const manufacturer = await prisma.manufacturer.create({
      data: {
        ...body,
        slug,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: manufacturer,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating manufacturer:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create manufacturer',
      },
      { status: 500 }
    )
  }
}
