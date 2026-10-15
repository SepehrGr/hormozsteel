import type { NextRequest } from 'next/server'
import type { InboxNotification, InboxNotifications } from '@/types'

import { NextResponse } from 'next/server'

import { requireApiAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { checkApiRateLimitAndRespond } from '@/lib/rate-limit'

const LIMIT = 10

// GET /api/admin/notifications - the admin bell, polled every 30 s
export async function GET(request: NextRequest) {
  const limited = checkApiRateLimitAndRespond(request)

  if (limited) return limited

  const { error } = await requireApiAuth()

  if (error) return error

  try {
    const latest = { orderBy: { createdAt: 'desc' }, take: LIMIT } as const
    const [messages, orders, newMessages, pendingOrders] = await Promise.all([
      prisma.contactForm.findMany({
        where: { status: 'NEW' },
        select: { id: true, name: true, createdAt: true },
        ...latest,
      }),
      prisma.quickOrder.findMany({
        where: { status: 'PENDING' },
        select: { id: true, customerName: true, createdAt: true },
        ...latest,
      }),
      prisma.contactForm.count({ where: { status: 'NEW' } }),
      prisma.quickOrder.count({ where: { status: 'PENDING' } }),
    ])

    const items: InboxNotification[] = [
      ...messages.map(m => ({
        id: m.id,
        type: 'contact' as const,
        name: m.name,
        createdAt: m.createdAt.toISOString(),
      })),
      ...orders.map(o => ({
        id: o.id,
        type: 'order' as const,
        name: o.customerName,
        createdAt: o.createdAt.toISOString(),
      })),
    ]
      // ISO strings in UTC sort the same as the dates they hold
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, LIMIT)

    const data: InboxNotifications = {
      count: newMessages + pendingOrders,
      items,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching notifications:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to load notifications' },
      { status: 500 },
    )
  }
}
