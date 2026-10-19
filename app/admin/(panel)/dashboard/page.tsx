import type { PriceDirection, QuickOrderStatus } from '@prisma/client'

import { Inbox, LayoutDashboard, LineChart, Mail, Package } from 'lucide-react'
import Link from 'next/link'

import { ActivityFeed } from '@/components/admin/dashboard/activity-feed'
import { PriceBoard } from '@/components/admin/dashboard/price-board'
import { RequestDesk } from '@/components/admin/dashboard/request-desk'
import { PageHeader } from '@/components/admin/page-header'
import { StatsBoard } from '@/components/admin/stats-board'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/lib/admin-auth'
import { formatRelative, pluralize } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { sum } from '@/lib/utils'

const OPEN: QuickOrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING']

export default async function DashboardPage() {
  await requireAuth()

  const [
    productCount,
    outOfStock,
    directions,
    requestCounts,
    newMessages,
    requests,
    priceChangeCount,
    changes,
    logs,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { inStock: false } }),
    prisma.product.groupBy({ by: ['priceDirection'], _count: true }),
    prisma.quickOrder.groupBy({ by: ['status'], _count: true }),
    prisma.contactForm.count({ where: { status: 'NEW' } }),
    prisma.quickOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        companyName: true,
        city: true,
        productSpecs: true,
        quantity: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.priceHistory.count(),
    prisma.priceHistory.findMany({
      orderBy: { changedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        oldPrice: true,
        newPrice: true,
        direction: true,
        changedAt: true,
        product: { select: { name: true, unit: true } },
      },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        details: true,
        userId: true,
        userName: true,
        createdAt: true,
      },
    }),
  ])

  const countOf = (status: QuickOrderStatus) =>
    requestCounts.find(row => row.status === status)?._count ?? 0
  const openRequests = sum(OPEN, countOf)
  const split: Record<PriceDirection, number> = { UP: 0, STABLE: 0, DOWN: 0 }

  for (const row of directions) split[row.priceDirection] = row._count

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={
          <Button asChild>
            <Link href='/admin/products'>Update prices</Link>
          </Button>
        }
        description='Open requests, price moves and recent changes in one place.'
        icon={LayoutDashboard}
        title='Dashboard'
      />

      <StatsBoard
        stats={[
          {
            label: 'Open requests',
            value: openRequests,
            detail: `${countOf('PENDING')} waiting for a reply`,
            icon: Inbox,
            href: '/admin/orders',
          },
          {
            label: 'New messages',
            value: newMessages,
            detail: newMessages ? 'Not read yet' : 'All read',
            icon: Mail,
            href: '/admin/orders?tab=contact&status=NEW',
          },
          {
            label: 'Products',
            value: productCount,
            detail: `${outOfStock} out of stock`,
            icon: Package,
            href: outOfStock ? '/admin/products?stock=out' : '/admin/products',
          },
          {
            label: 'Prices updated',
            value: changes[0]
              ? formatRelative(changes[0].changedAt, { narrow: true })
              : '—',
            detail: `${pluralize(priceChangeCount, 'change')} logged`,
            icon: LineChart,
            href: '/admin/products',
          },
        ]}
      />

      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'>
        <RequestDesk requests={requests} />
        <div className='lg:col-start-2 lg:row-span-2 lg:row-start-1'>
          <PriceBoard changes={changes} split={split} />
        </div>
        <ActivityFeed logs={logs} />
      </div>
    </div>
  )
}
