import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getAuthSession()

  if (!session || !session.user) {
    redirect('/admin/login')
  }

  return session
}

/**
 * Auth gate for route handlers. `requireAuth()` redirects, which a `fetch`
 * caller cannot follow and which a handler's own `catch` would turn into a
 * 500 — API routes return 401 JSON instead.
 */
export async function requireApiAuth() {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      ),
    }
  }

  return { session, error: null }
}

export async function requireSuperAdmin() {
  const session = await requireAuth()

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard')
  }

  return session
}

export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any,
  request?: Request,
) {
  const ipAddress =
    request?.headers.get('x-forwarded-for') ||
    request?.headers.get('x-real-ip') ||
    'unknown'

  const userAgent = request?.headers.get('user-agent') || 'unknown'

  await prisma.adminLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    },
  })
}
