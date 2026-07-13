import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
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
