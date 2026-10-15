import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { checkSubmitRateLimitAndRespond } from '@/lib/rate-limit'

// POST /api/quick-orders - Create a new quick order (public quote form)
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkSubmitRateLimitAndRespond(request)

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
