import { NextRequest, NextResponse } from 'next/server'

import { logAdminAction, requireApiAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'
import { isValidSlug } from '@/lib/slug-generator'
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    50,
    15 * 60 * 1000,
  )

  if (rateLimitResponse) return rateLimitResponse

  const { session, error: authError } = await requireApiAuth()

  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()

    if (body.slug !== undefined && !isValidSlug(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Slug is required and may only contain lowercase letters, numbers, and single hyphens',
        },
        { status: 400 },
      )
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        sortOrder: body.sortOrder,
        subcategories: body.subcategories,
      },
    })

    await logAdminAction(
      session.user.id,
      'UPDATE',
      'Category',
      id,
      body,
      request,
    )

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating category:', error)

    // Prisma unique-constraint violation: another category already has this slug
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Slug is already in use' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    50,
    15 * 60 * 1000,
  )

  if (rateLimitResponse) return rateLimitResponse

  const { session, error: authError } = await requireApiAuth()

  if (authError) return authError

  try {
    const { id } = await params

    await prisma.category.delete({ where: { id } })
    await logAdminAction(
      session.user.id,
      'DELETE',
      'Category',
      id,
      undefined,
      request,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 },
    )
  }
}
