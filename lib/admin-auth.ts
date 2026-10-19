import type { Prisma } from '@prisma/client'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/rate-limit'

/** One session read per request, however many layouts and pages ask. */
export const getAuthSession = cache(() => getServerSession(authOptions))

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

/** `source` is the route's Request, or `await headers()` inside a Server Action. */
export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Prisma.InputJsonValue,
  source?: Request | Headers,
  db: Prisma.TransactionClient = prisma,
) {
  const headers = source instanceof Headers ? source : source?.headers
  const ipAddress = headers ? getClientIP(headers) : 'unknown'
  const userAgent = headers?.get('user-agent') || 'unknown'
  const author = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true },
  })

  await db.adminLog.create({
    data: {
      userId,
      userName: author.name,
      userEmail: author.email,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    },
  })
}
