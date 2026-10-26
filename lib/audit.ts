import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/rate-limit'

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
