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
        { status: 404 }
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
      { status: 500 }
    )
  }
}

// PUT /api/manufacturers/[id] - Update a manufacturer
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if manufacturer exists
    const existingManufacturer = await prisma.manufacturer.findUnique({
      where: { id },
    })

    if (!existingManufacturer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manufacturer not found',
        },
        { status: 404 }
      )
    }

    // If name is being updated, regenerate slug
    let updateData = { ...body }
    if (body.name && body.name !== existingManufacturer.name) {
      const newSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Allow Persian characters
        .replace(/\s+/g, '-')
        .trim()

      // Check if new slug conflicts with existing manufacturers (excluding current)
      const slugConflict = await prisma.manufacturer.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: 'Manufacturer with this name already exists',
          },
          { status: 400 }
        )
      }

      updateData.slug = newSlug
    }

    // Update the manufacturer
    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: manufacturer,
    })
  } catch (error) {
    console.error('Error updating manufacturer:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update manufacturer',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/manufacturers/[id] - Delete a manufacturer
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if manufacturer exists
    const existingManufacturer = await prisma.manufacturer.findUnique({
      where: { id },
    })

    if (!existingManufacturer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manufacturer not found',
        },
        { status: 404 }
      )
    }

    // Delete the manufacturer
    await prisma.manufacturer.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Manufacturer deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting manufacturer:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete manufacturer',
      },
      { status: 500 }
    )
  }
}
