import type { AdminLog } from '@prisma/client'

import { History } from 'lucide-react'

import { DataCard, DataCardLink } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { formatDateTime, formatRelative, pluralize } from '@/lib/format'

export type Log = Pick<
  AdminLog,
  | 'id'
  | 'action'
  | 'resourceType'
  | 'resourceId'
  | 'details'
  | 'userId'
  | 'userName'
  | 'createdAt'
>

export const NOUNS: Record<string, string> = {
  User: 'admin',
  Product: 'product',
  PRODUCT: 'product',
  Category: 'category',
  Manufacturer: 'manufacturer',
  QuickOrder: 'quote request',
  ContactForm: 'message',
}

const VERBS: Record<string, string> = {
  CREATE: 'added',
  UPDATE: 'updated',
  DELETE: 'deleted',
  UNLOCK: 'unlocked',
}

/**
 * A log row as `[what was done, what it was done to]`, from the shapes the
 * actions write into `details`: a `name`, a `customer`, a `status`, or
 * a list of products.
 */
export function describe({
  action,
  resourceType,
  resourceId,
  details,
  userId,
}: Log): [string, string?] {
  const d =
    details && typeof details === 'object' && !Array.isArray(details)
      ? details
      : {}
  const noun = NOUNS[resourceType] ?? resourceType.toLowerCase()
  const verb = VERBS[action] ?? action.toLowerCase().replaceAll('_', ' ')

  if (resourceType === 'User' && resourceId && resourceId === userId) {
    return [`${verb} their own account`]
  }

  if (action === 'IMPORT') {
    return [
      `imported products: ${d.created ?? 0} new, ${d.updated ?? 0} updated`,
    ]
  }

  const many = Array.isArray(d.products)
    ? d.products.length
    : Array.isArray(d.ids)
      ? d.ids.length
      : 0

  if (many > 1) return [`${verb} ${pluralize(many, noun)}`]

  const subject = d.name ?? d.customer

  if (typeof subject === 'string') return [`${verb} ${noun}`, subject]
  if (typeof d.status === 'string') {
    return [`marked a ${noun} ${d.status.toLowerCase()}`]
  }

  return [`${verb} a ${noun}`]
}

/** The latest audit-log rows, newest first. */
export function ActivityFeed({ logs }: { logs: Log[] }) {
  return (
    <DataCard
      actions={<DataCardLink href='/admin/logs'>Full log</DataCardLink>}
      icon={History}
      title='Recent activity'
    >
      {logs.length === 0 ? (
        <EmptyState
          description='Changes made in the admin are listed here.'
          icon={History}
          title='No activity yet'
        />
      ) : (
        <ol className='divide-y divide-border'>
          {logs.map(log => {
            const [what, subject] = describe(log)

            return (
              <li key={log.id} className='flex items-start gap-3 px-4 py-3'>
                <span
                  aria-hidden
                  className='flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-muted font-mono text-xs font-semibold text-foreground'
                >
                  {log.userName.charAt(0).toUpperCase()}
                </span>
                <p className='min-w-0 flex-1 text-sm text-muted-foreground'>
                  <span className='font-medium text-foreground'>
                    {log.userName}
                  </span>
                  {log.userId ? null : ' (deleted)'} {what}
                  {subject ? (
                    <>
                      {' '}
                      <span className='font-medium text-foreground'>
                        {subject}
                      </span>
                    </>
                  ) : null}
                </p>
                <time
                  className='shrink-0 text-xs text-muted-foreground'
                  dateTime={log.createdAt.toISOString()}
                  title={formatDateTime(log.createdAt)}
                >
                  {formatRelative(log.createdAt)}
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </DataCard>
  )
}
