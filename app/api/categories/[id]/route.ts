import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
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
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: includeProducts
          ? {
              include: productInclude,
              orderBy: { name: 'asc' },
            }
          : false,
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 },
      )
    }

    const data = {
      ...category,
      products: Array.isArray(category.products)
        ? category.products.map(p => toProductDTO(p as never))
        : category.products,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching category:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 },
    )
  }
}
