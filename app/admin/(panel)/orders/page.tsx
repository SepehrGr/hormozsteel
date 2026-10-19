import Link from 'next/link'
import { Clock, Inbox, Mail, MailOpen, Package } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { ContactMessagesTable } from '@/components/admin/orders/contact-messages-table'
import { QuickOrdersTable } from '@/components/admin/orders/quick-orders-table'
import { PageHeader } from '@/components/admin/page-header'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { Select } from '@/components/ui/field'
import {
  CONTACT_STATUSES,
  QUICK_ORDER_STATUSES,
  statusLabel,
} from '@/config/order-status'
import { requireAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { cn, sum } from '@/lib/utils'

type Tab = 'quick' | 'contact'
type StatusCount = { status: string; _count: number }

const countOf = (rows: StatusCount[], status?: string) =>
  sum(
    rows.filter(row => !status || row.status === status),
    row => row._count,
  )

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string | string[]
    q?: string | string[]
    status?: string | string[]
  }>
}) {
  await requireAuth()

  const { tab: tabParam, q, status: statusParam } = await searchParams
  const tab: Tab = tabParam === 'contact' ? 'contact' : 'quick'
  const query = typeof q === 'string' ? q.trim() : ''
  // Anything that isn't one of this tab's statuses means "all statuses"
  const orderStatus = QUICK_ORDER_STATUSES.find(s => s === statusParam)
  const messageStatus = CONTACT_STATUSES.find(s => s === statusParam)
  const status = tab === 'quick' ? orderStatus : messageStatus
  const search = { contains: query, mode: 'insensitive' } as const

  // ponytail: no pagination; reuse the products one when the inbox outgrows a page.
  const [orderCounts, messageCounts, orders, messages] = await Promise.all([
    prisma.quickOrder.groupBy({ by: ['status'], _count: true }),
    prisma.contactForm.groupBy({ by: ['status'], _count: true }),
    tab === 'quick'
      ? prisma.quickOrder.findMany({
          where: {
            status: orderStatus,
            OR: query
              ? [
                  { customerName: search },
                  { companyName: search },
                  { phoneNumber: search },
                  { city: search },
                  { productSpecs: search },
                ]
              : undefined,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
    tab === 'contact'
      ? prisma.contactForm.findMany({
          where: {
            status: messageStatus,
            OR: query
              ? [
                  { name: search },
                  { email: search },
                  { phone: search },
                  { message: search },
                ]
              : undefined,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
  ])

  const tabs = [
    { id: 'quick', label: 'Quote requests', count: countOf(orderCounts) },
    { id: 'contact', label: 'Contact messages', count: countOf(messageCounts) },
  ] as const
  const rows = tab === 'quick' ? orders.length : messages.length

  return (
    <div className='space-y-6'>
      <PageHeader
        description='Quote requests and contact messages from the public site.'
        icon={Inbox}
        title='Orders & inquiries'
      />

      <StatsBoard
        stats={[
          { label: 'Quote requests', value: tabs[0].count, icon: Package },
          {
            label: 'Pending quotes',
            value: countOf(orderCounts, 'PENDING'),
            icon: Clock,
          },
          { label: 'Contact messages', value: tabs[1].count, icon: Mail },
          {
            label: 'New messages',
            value: countOf(messageCounts, 'NEW'),
            icon: MailOpen,
          },
        ]}
      />

      <nav aria-label='Inbox' className='flex border-b border-border'>
        {tabs.map(t => (
          <Link
            key={t.id}
            aria-current={t.id === tab ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ease-out',
              t.id === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
            href={
              t.id === 'quick' ? '/admin/orders' : '/admin/orders?tab=contact'
            }
          >
            {t.label}
            <span className='ml-2 font-mono text-xs tabular-nums text-muted-foreground'>
              {t.count}
            </span>
          </Link>
        ))}
      </nav>

      <SearchToolbar
        filtered={Boolean(status)}
        params={tab === 'contact' ? { tab } : undefined}
        path='/admin/orders'
        placeholder={
          tab === 'quick'
            ? 'Search name, company, phone, specs…'
            : 'Search name, email, phone, message…'
        }
        query={query}
      >
        {/* key resets the uncontrolled select when the URL changes */}
        <Select
          key={`${tab}-${status}`}
          aria-label='Status'
          className='sm:w-44'
          defaultValue={status ?? ''}
          name='status'
        >
          <option value=''>All statuses</option>
          {(tab === 'quick' ? QUICK_ORDER_STATUSES : CONTACT_STATUSES).map(
            s => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ),
          )}
        </Select>
      </SearchToolbar>

      <DataCard
        titleHidden
        title={`${tab === 'quick' ? 'Quote requests' : 'Contact messages'} (${rows})`}
      >
        {rows === 0 ? (
          <EmptyState
            description={
              query || status
                ? 'Try a different search or status.'
                : 'New submissions from the public site show up here.'
            }
            icon={tab === 'quick' ? Package : Mail}
            title={
              query || status
                ? 'Nothing matches these filters'
                : 'Inbox is empty'
            }
          />
        ) : tab === 'quick' ? (
          <QuickOrdersTable orders={orders} />
        ) : (
          <ContactMessagesTable messages={messages} />
        )}
      </DataCard>
    </div>
  )
}
