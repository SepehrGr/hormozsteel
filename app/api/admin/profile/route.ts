import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/profile - Get current admin's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 },
      )
    }

    // Get additional profile info from custom fields if they exist
    // For now, we'll just return the basic user info
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name || '',
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
      },
      { status: 500 },
    )
  }
}

// PATCH /api/admin/profile - Update current admin's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (email && typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 },
      )
    }

    // Validate password if provided
    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Password must be at least 6 characters long',
          },
          { status: 400 },
        )
      }
    }

    // Check if new email is already taken by another user
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already in use',
          },
          { status: 400 },
        )
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined
    if (password) {
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(password, salt)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email,
        phone: '',
        company: '',
      },
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
      },
      { status: 500 },
    )
  }
}
