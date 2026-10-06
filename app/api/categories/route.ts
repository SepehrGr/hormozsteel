import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'
import { isValidSlug } from '@/lib/slug-generator'

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)

  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const categories = await prisma.category.findMany({
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
        _count: { select: { products: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
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

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 },
      )
    }

    const slug =
      body.slug !== undefined
        ? body.slug
        : String(body.name)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/[\s-]+/g, '-')
            .replace(/^-|-$/g, '')

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Slug is required and may only contain lowercase letters, numbers, and single hyphens',
        },
        { status: 400 },
      )
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? null,
        icon: body.icon ?? null,
        sortOrder: body.sortOrder ?? 0,
        subcategories: body.subcategories || [],
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
