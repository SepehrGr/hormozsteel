import type { Prisma } from '@prisma/client'

import { CalendarDays, Clock, History, Users } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import {
  actionLabel,
  LogsTable,
  typeLabel,
} from '@/components/admin/logs/logs-table'
import { PageHeader } from '@/components/admin/page-header'
import { pageParams, Pagination } from '@/components/admin/pagination'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { Select } from '@/components/ui/field'
import { requireAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

const DAY = 24 * 60 * 60 * 1000

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAuth()

  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim() : ''
  const { page, limit, skip } = pageParams(params.page, params.limit)
  const now = Date.now()
  const weekAgo = new Date(now - 7 * DAY)

  const [actions, types] = await Promise.all([
    prisma.adminLog.groupBy({ by: ['action'], _count: true }),
    prisma.adminLog.groupBy({ by: ['resourceType'], _count: true }),
  ])
  // Only values that exist in the log; anything else means "all"
  const action = actions.find(row => row.action === params.action)?.action
  const type = types.find(row => row.resourceType === params.type)?.resourceType
  const search = { contains: query, mode: 'insensitive' } as const
  const where: Prisma.AdminLogWhereInput = {
    action,
    resourceType: type,
    OR: query
      ? [{ userName: search }, { userEmail: search }, { resourceId: search }]
      : undefined,
  }
  const filterParams = Object.fromEntries(
    Object.entries({ q: query, action, type }).filter(([, value]) => value),
  ) as Record<string, string>

  const [logs, total, entries, today, thisWeek, admins] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      omit: { ipAddress: true, userAgent: true },
    }),
    prisma.adminLog.count({ where }),
    prisma.adminLog.count(),
    prisma.adminLog.count({
      where: { createdAt: { gte: new Date(now - DAY) } },
    }),
    prisma.adminLog.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.adminLog.groupBy({
      by: ['userEmail'],
      where: { createdAt: { gte: weekAgo } },
    }),
  ])
  const filtered = Boolean(query || action || type)

  return (
    <div className='space-y-6'>
      <PageHeader
        description='Every change made in the admin: who made it, to what, and when.'
        icon={History}
        title='Activity log'
      />

      <StatsBoard
        stats={[
          { label: 'Entries', value: entries, icon: History },
          { label: 'Last 24 hours', value: today, icon: Clock },
          { label: 'Last 7 days', value: thisWeek, icon: CalendarDays },
          {
            label: 'Admins this week',
            value: admins.length,
            icon: Users,
          },
        ]}
      />

      <SearchToolbar
        filtered={Boolean(action || type)}
        path='/admin/logs'
        placeholder='Search admin name, email or record ID…'
        query={query}
      >
        {/* key resets the uncontrolled selects when the URL changes */}
        <Select
          key={`action-${action}`}
          aria-label='Action'
          className='sm:w-40'
          defaultValue={action ?? ''}
          name='action'
        >
          <option value=''>All actions</option>
          {actions.map(row => (
            <option key={row.action} value={row.action}>
              {actionLabel(row.action)} ({row._count})
            </option>
          ))}
        </Select>
        <Select
          key={`type-${type}`}
          aria-label='Record type'
          className='sm:w-44'
          defaultValue={type ?? ''}
          name='type'
        >
          <option value=''>All records</option>
          {types.map(row => (
            <option key={row.resourceType} value={row.resourceType}>
              {typeLabel(row.resourceType)} ({row._count})
            </option>
          ))}
        </Select>
      </SearchToolbar>

      <DataCard titleHidden title={`Activity (${total})`}>
        {logs.length > 0 ? (
          <LogsTable logs={logs} />
        ) : (
          <EmptyState
            description={
              filtered
                ? 'Try a different search, action or record type.'
                : 'Changes made in the admin are recorded here.'
            }
            icon={History}
            title={
              filtered ? 'No entries match these filters' : 'No activity yet'
            }
          />
        )}
        {total > 0 ? (
          <Pagination
            limit={limit}
            page={page}
            params={filterParams}
            path='/admin/logs'
            total={total}
          />
        ) : null}
      </DataCard>
    </div>
  )
}
