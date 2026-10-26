import type { AdminLog } from '@prisma/client'
import type { PillTone } from '@/components/admin/pill'

import { type Column, AdminTable } from '@/components/admin/admin-table'
import { describe, NOUNS } from '@/components/admin/dashboard/activity-feed'
import { Pill } from '@/components/admin/pill'
import {
  capitalize,
  formatDateTime,
  formatRelative,
  formatShortDateTime,
} from '@/lib/format'

const TONES: Record<string, PillTone> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  UNLOCK: 'warning',
  IMPORT: 'strong',
  LOGIN: 'neutral',
  LOGIN_FAILED: 'warning',
}

export const actionLabel = (action: string) =>
  capitalize(action.toLowerCase().replaceAll('_', ' '))

export const typeLabel = (type: string) =>
  capitalize(NOUNS[type] ?? type.toLowerCase())

/** `passwordChanged` → `Password changed`, `categoryId` → `Category ID` */
const keyLabel = (key: string) =>
  capitalize(key.replace(/([A-Z])/g, ' $1').toLowerCase()).replace(
    /\bid(s?)\b/i,
    'ID$1',
  )

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'

    // Bulk deletes log `{ id, name }` rows: the names are what matter
    return value
      .map(item =>
        item && typeof item === 'object' && 'name' in item
          ? String(item.name)
          : typeof item === 'object'
            ? JSON.stringify(item)
            : String(item),
      )
      .join(', ')
  }
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

type Log = Omit<AdminLog, 'ipAddress' | 'userAgent'>

const columns: Column<Log>[] = [
  {
    label: 'Event',
    narrow: 'title',
    cell: log => {
      const [what, subject] = describe(log)

      return (
        <div className='flex items-start gap-3'>
          <span
            aria-hidden
            className='flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-muted font-mono text-xs font-semibold text-foreground'
          >
            {log.userName.charAt(0).toUpperCase()}
          </span>
          <div className='min-w-0'>
            <p className='text-muted-foreground'>
              <span className='font-medium text-foreground'>
                {log.userName}
              </span>
              {log.userId ? null : ' (deleted)'} {what}
              {subject ? (
                <>
                  {' '}
                  <span className='font-medium text-foreground'>{subject}</span>
                </>
              ) : null}
            </p>
            <p className='mt-0.5 truncate text-xs text-muted-foreground'>
              {log.userEmail}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    label: 'Action',
    narrow: 'summary',
    cell: log => (
      <Pill tone={TONES[log.action] ?? 'neutral'}>
        {actionLabel(log.action)}
      </Pill>
    ),
  },
  {
    label: 'Record',
    cell: log => (
      <div>
        <p className='text-foreground'>{typeLabel(log.resourceType)}</p>
        {log.resourceId ? (
          <p
            className='mt-0.5 max-w-[10rem] truncate font-mono text-xs text-muted-foreground'
            title={log.resourceId}
          >
            {log.resourceId}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    label: 'When',
    className: 'whitespace-nowrap',
    cell: log => (
      <time
        dateTime={log.createdAt.toISOString()}
        title={formatDateTime(log.createdAt)}
      >
        <span className='block font-mono text-xs tabular-nums text-foreground'>
          {formatShortDateTime(log.createdAt)}
        </span>
        <span className='mt-0.5 block text-xs text-muted-foreground'>
          {formatRelative(log.createdAt)}
        </span>
      </time>
    ),
  },
]

/** Audit-log rows, each opening onto what was recorded. */
export function LogsTable({ logs }: { logs: Log[] }) {
  return (
    <AdminTable
      columns={columns}
      detail={log => <LogDetails log={log} />}
      rowLabel={log =>
        `Details of ${log.userName}'s ${actionLabel(log.action).toLowerCase()}`
      }
      rows={logs}
    />
  )
}

function LogDetails({ log }: { log: Log }) {
  const changes =
    log.details &&
    typeof log.details === 'object' &&
    !Array.isArray(log.details)
      ? Object.entries(log.details)
      : []
  const context: [string, string | null][] = [
    ['Time', formatDateTime(log.createdAt)],
    ['Record ID', log.resourceId],
    ['Log ID', log.id],
  ]

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
      <Fields
        empty='No details were recorded.'
        rows={changes.map(([key, value]) => [keyLabel(key), valueText(value)])}
        title='Recorded details'
      />
      <Fields mono rows={context} title='Context' />
    </div>
  )
}

function Fields({
  title,
  rows,
  empty,
  mono = false,
}: {
  title: string
  rows: [string, string | null][]
  empty?: string
  mono?: boolean
}) {
  return (
    <section>
      <h3 className='mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className='text-muted-foreground'>{empty}</p>
      ) : (
        <dl className='divide-y divide-border border-y border-border'>
          {rows.map(([label, value]) => (
            <div
              key={label}
              className='grid gap-1 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3'
            >
              <dt className='text-xs text-muted-foreground'>{label}</dt>
              <dd
                className={
                  mono
                    ? 'break-all font-mono text-xs text-foreground'
                    : 'whitespace-pre-line break-words text-foreground'
                }
              >
                {value || '—'}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
