import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/manufacturers/[id] - Get a single manufacturer
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
    })

    if (!manufacturer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manufacturer not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: manufacturer,
    })
  } catch (error) {
    console.error('Error fetching manufacturer:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch manufacturer',
      },
      { status: 500 },
    )
  }
}
