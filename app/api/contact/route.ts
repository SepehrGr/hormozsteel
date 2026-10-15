import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { checkSubmitRateLimitAndRespond } from '@/lib/rate-limit'

// POST /api/contact - Create a new contact form submission
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkSubmitRateLimitAndRespond(request)

  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { name, phone, email, message } = body

    // Validation
    if (!name || !phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, phone, and message are required.',
        },
        { status: 400 },
      )
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Enter a valid email address.',
          },
          { status: 400 },
        )
      }
    }

    // Create contact form
    const contactForm = await prisma.contactForm.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        message: message.trim(),
        status: 'NEW',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message:
          'Message received. Sales will follow up on the next business day.',
        data: contactForm,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating contact form:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send your message. Please try again.',
      },
      { status: 500 },
    )
  }
}
