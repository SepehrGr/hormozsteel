import { NextRequest, NextResponse } from 'next/server'
import { Prisma, QuickOrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logAdminAction, requireApiAuth } from '@/lib/admin-auth'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

/** Public quote submissions get a tighter budget than the admin reads. */
const SUBMIT_MAX_ATTEMPTS = 20
const SUBMIT_WINDOW_MS = 15 * 60 * 1000

function parseStatus(value: string | null) {
  if (!value) return null

  const upper = value.toUpperCase()

  return upper in QuickOrderStatus ? (upper as QuickOrderStatus) : null
}

function isMissingRecord(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  )
}

// GET /api/quick-orders - Get all quick orders (Admin only)
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) return rateLimitResponse

  const { error: authError } = await requireApiAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '50') || 50),
    )

    const where: Prisma.QuickOrderWhereInput = {}

    if (statusParam && statusParam !== 'all') {
      const status = parseStatus(statusParam)

      if (!status) {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown status "${statusParam}"`,
            details: `Expected one of: ${Object.keys(QuickOrderStatus).join(', ')}`,
          },
          { status: 400 },
        )
      }

      where.status = status
    }

    const skip = (page - 1) * limit

    const [quickOrders, total] = await Promise.all([
      prisma.quickOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.quickOrder.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        quickOrders,
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
    console.error('Error fetching quick orders:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quick orders',
      },
      { status: 500 },
    )
  }
}

// POST /api/quick-orders - Create a new quick order (public quote form)
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    SUBMIT_MAX_ATTEMPTS,
    SUBMIT_WINDOW_MS,
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const {
      customerName,
      companyName,
      phoneNumber,
      city,
      productSpecs,
      quantity,
      deliveryDate,
      deliveryMethod,
      additionalNotes,
      productName,
    } = body

    // Validation
    if (!customerName || !phoneNumber || !city || !productSpecs || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all the required fields.',
        },
        { status: 400 },
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s()-]{7,20}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number format is incorrect.',
        },
        { status: 400 },
      )
    }

    // Create quick order
    const quickOrder = await prisma.quickOrder.create({
      data: {
        customerName: customerName.trim(),
        companyName: companyName?.trim() || null,
        phoneNumber: phoneNumber.trim(),
        city: city.trim(),
        productSpecs: productSpecs.trim(),
        quantity: quantity.trim(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryMethod: deliveryMethod?.toUpperCase() || 'PICKUP',
        additionalNotes: additionalNotes?.trim() || null,
        productName: productName?.trim() || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message:
          'Order request submitted. Sales will get back to you the next business day.',
        data: quickOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating quick order:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quote request. Please try again.',
      },
      { status: 500 },
    )
  }
}

// PATCH /api/quick-orders - Update quick order status (Admin only)
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) return rateLimitResponse

  const { session, error: authError } = await requireApiAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, status: statusInput } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID is required',
        },
        { status: 400 },
      )
    }

    const status = parseStatus(statusInput)

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid status is required',
          details: `Expected one of: ${Object.keys(QuickOrderStatus).join(', ')}`,
        },
        { status: 400 },
      )
    }

    const quickOrder = await prisma.quickOrder.update({
      where: { id },
      data: { status },
    })

    await logAdminAction(
      session.user.id,
      'UPDATE',
      'QuickOrder',
      quickOrder.id,
      { status },
      request,
    )

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: quickOrder,
    })
  } catch (error) {
    if (isMissingRecord(error)) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 },
      )
    }

    console.error('Error updating quick order:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Order status update failed',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/quick-orders - Delete a quick order (Admin only)
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) return rateLimitResponse

  const { session, error: authError } = await requireApiAuth()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID is required',
        },
        { status: 400 },
      )
    }

    await prisma.quickOrder.delete({
      where: { id },
    })

    await logAdminAction(session.user.id, 'DELETE', 'QuickOrder', id, null, request)

    return NextResponse.json({
      success: true,
      message: 'Order removed successfully',
    })
  } catch (error) {
    if (isMissingRecord(error)) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 },
      )
    }

    console.error('Error deleting quick order:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Order deletion failed',
      },
      { status: 500 },
    )
  }
}
