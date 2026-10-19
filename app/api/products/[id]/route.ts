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
