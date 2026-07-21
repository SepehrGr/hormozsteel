import { NextRequest, NextResponse } from 'next/server'
import { ProductUnit, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'
import {
  productInclude,
  toProductDTO,
  resolveManufacturerId,
} from '@/lib/product-dto'

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
      const isCuid = category.startsWith('c') && category.length > 20
      if (isCuid) {
        where.categoryId = category
      } else {
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

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    50,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()

    if (!body.name || !body.categoryId || body.price == null) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, categoryId, and price are required',
        },
        { status: 400 },
      )
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

    const categoryExists = await prisma.category.findUnique({
      where: { id: body.categoryId },
    })
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 400 },
      )
    }

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Product with this name already exists' },
        { status: 400 },
      )
    }

    const unit =
      typeof body.unit === 'string' && body.unit.toUpperCase() in ProductUnit
        ? (body.unit.toUpperCase() as ProductUnit)
        : ProductUnit.KG

    // Form still sends free-text "brand"; map to Manufacturer relation
    const manufacturerId = await resolveManufacturerId({
      manufacturerId: body.manufacturerId,
      brand: body.brand,
    })

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? null,
        size: body.size || '',
        unit,
        price: Number(body.price),
        weightKg: body.weightKg ?? body.weight ?? null,
        inStock: body.inStock ?? true,
        images: body.images || [],
        subcategory: body.subcategory ?? null,
        specs: body.specs ?? body.specifications ?? null,
        features: body.features || [],
        applications: body.applications || [],
        categoryId: body.categoryId,
        manufacturerId,
      },
      include: productInclude,
    })

    return NextResponse.json(
      { success: true, data: toProductDTO(product) },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
