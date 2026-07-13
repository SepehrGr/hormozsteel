import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, logAdminAction } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

// Get all admin users (Super Admin only)
export async function GET(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const session = await getAuthSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      )
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: { users } })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}

// Create new admin user (Super Admin only)
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    50,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const session = await getAuthSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      )
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, name, and role are required',
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as 'ADMIN' | 'SUPER_ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      'CREATE',
      'USER',
      user.id,
      {
        createdUser: { email, name, role },
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 },
    )
  }
}
