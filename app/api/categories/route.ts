import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

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
