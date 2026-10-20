import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { checkSubmitRateLimitAndRespond } from '@/lib/rate-limit'
import { quickOrderSchema } from '@/lib/schemas/quick-order'

// POST /api/quick-orders - Create a new quick order (public quote form)
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkSubmitRateLimitAndRespond(request)

  if (rateLimitResponse) return rateLimitResponse

  try {
    const parsed = quickOrderSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check the highlighted fields.',
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      )
    }

    const quickOrder = await prisma.quickOrder.create({
      data: parsed.data,
      select: { id: true },
    })

    return NextResponse.json(
      { success: true, data: quickOrder },
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
