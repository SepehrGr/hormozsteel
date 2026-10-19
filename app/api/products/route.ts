import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'
import { productInclude, toProductDTO } from '@/lib/product-dto'

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)

  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const brand = searchParams.get('brand')
    const inStock = searchParams.get('inStock')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'price',
      'name',
      'inStock',
    ]
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt'

    const where: Prisma.ProductWhereInput = {}

    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      })

      if (!categoryRecord) {
        return NextResponse.json(
          {
            success: false,
            error: `Category with slug "${category}" not found`,
          },
          { status: 404 },
        )
      }

      where.categoryId = categoryRecord.id
    }

    if (subcategory) where.subcategory = subcategory

    if (brand) {
      where.manufacturer = {
        name: { contains: brand, mode: 'insensitive' },
      }
    }

    if (inStock === 'true') where.inStock = true
    else if (inStock === 'false') where.inStock = false

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { size: { contains: search, mode: 'insensitive' } },
        {
          manufacturer: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { [finalSortBy]: sortOrder as 'asc' | 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(toProductDTO),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
