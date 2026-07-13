import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthSession, logAdminAction } from '@/lib/admin-auth'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

type Role = 'ADMIN' | 'SUPER_ADMIN'

function isRole(value: unknown): value is Role {
  return value === 'ADMIN' || value === 'SUPER_ADMIN'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = checkApiRateLimitAndRespond(request)
  if (rateLimitResponse) return rateLimitResponse

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

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    80,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) return rateLimitResponse

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

  const { id } = await params

  try {
    const body = await request.json()
    const {
      email,
      name,
      role,
      isActive,
      password,
    }: {
      email?: unknown
      name?: unknown
      role?: unknown
      isActive?: unknown
      password?: unknown
    } = body ?? {}

    if (id === session.user.id) {
      if (typeof isActive === 'boolean' && isActive === false) {
        return NextResponse.json(
          { success: false, error: 'You cannot deactivate your own account' },
          { status: 400 },
        )
      }
      if (role && role !== session.user.role) {
        return NextResponse.json(
          { success: false, error: 'You cannot change your own role' },
          { status: 400 },
        )
      }
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true, name: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    }

    const updateData: any = {}
    const details: Record<string, any> = {}

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 },
        )
      }

      if (email !== existing.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        })
        if (emailTaken && emailTaken.id !== id) {
          return NextResponse.json(
            { success: false, error: 'Email already in use' },
            { status: 400 },
          )
        }
        updateData.email = email
        details.email = { from: existing.email, to: email }
      }
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Name is required' },
          { status: 400 },
        )
      }
      updateData.name = name.trim()
      details.name = { from: existing.name, to: updateData.name }
    }

    if (role !== undefined) {
      if (!isRole(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 },
        )
      }

      if (existing.role === 'SUPER_ADMIN' && role === 'ADMIN') {
        const superAdminsCount = await prisma.user.count({
          where: { role: 'SUPER_ADMIN', isActive: true },
        })
        if (superAdminsCount <= 1) {
          return NextResponse.json(
            {
              success: false,
              error: 'Cannot demote the last active super admin',
            },
            { status: 400 },
          )
        }
      }

      updateData.role = role
      details.role = { from: existing.role, to: role }
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Invalid isActive value' },
          { status: 400 },
        )
      }

      if (existing.role === 'SUPER_ADMIN' && isActive === false) {
        const superAdminsCount = await prisma.user.count({
          where: { role: 'SUPER_ADMIN', isActive: true },
        })
        if (superAdminsCount <= 1) {
          return NextResponse.json(
            { success: false, error: 'Cannot deactivate the last super admin' },
            { status: 400 },
          )
        }
      }

      updateData.isActive = isActive
      details.isActive = { from: existing.isActive, to: isActive }
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Password must be at least 6 characters long',
          },
          { status: 400 },
        )
      }
      updateData.password = await bcrypt.hash(password, 12)
      details.passwordReset = true
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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
    })

    await logAdminAction(
      session.user.id,
      'UPDATE',
      'USER',
      id,
      { changes: details },
      request,
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = checkApiRateLimitAndRespond(
    request,
    40,
    15 * 60 * 1000,
  )
  if (rateLimitResponse) return rateLimitResponse

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

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json(
      { success: false, error: 'You cannot delete your own account' },
      { status: 400 },
    )
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true, name: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    }

    if (existing.role === 'SUPER_ADMIN') {
      const superAdminsCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      })
      if (superAdminsCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last super admin' },
          { status: 400 },
        )
      }
    }

    await prisma.user.delete({ where: { id } })

    await logAdminAction(
      session.user.id,
      'DELETE',
      'USER',
      id,
      { deletedUser: { email: existing.email, name: existing.name } },
      request,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 },
    )
  }
}

