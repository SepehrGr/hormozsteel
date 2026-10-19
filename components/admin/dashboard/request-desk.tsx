import type { QuickOrder } from '@prisma/client'

import { Inbox } from 'lucide-react'
import Link from 'next/link'

import { DataCard, DataCardLink } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { StatusPill } from '@/components/admin/pill'
import { formatDateTime, formatRelative } from '@/lib/format'

type Request = Pick<
  QuickOrder,
  | 'id'
  | 'customerName'
  | 'companyName'
  | 'city'
  | 'productSpecs'
  | 'quantity'
  | 'status'
  | 'createdAt'
>

/** The latest quote requests; each row opens the inbox searched to it. */
export function RequestDesk({ requests }: { requests: Request[] }) {
  return (
    <DataCard
      actions={<DataCardLink href='/admin/orders'>Open inbox</DataCardLink>}
      icon={Inbox}
      title='Quote requests'
    >
      {requests.length === 0 ? (
        <EmptyState
          description='Requests from the order form on the site land here.'
          icon={Inbox}
          title='No quote requests yet'
        />
      ) : (
        <ul className='divide-y divide-border'>
          {requests.map(request => (
            <li key={request.id}>
              <Link
                className='flex items-start gap-3 px-4 py-3 transition-colors duration-200 ease-out hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
                href={`/admin/orders?q=${encodeURIComponent(request.customerName)}`}
              >
                <div className='min-w-0 flex-1'>
                  <p className='flex items-baseline gap-2'>
                    <span className='truncate text-sm font-medium text-foreground'>
                      {request.customerName}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {[request.companyName, request.city]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </p>
                  <p className='mt-1 truncate text-sm text-muted-foreground'>
                    <span className='font-mono text-xs tabular-nums text-foreground'>
                      {request.quantity}
                    </span>{' '}
                    · {request.productSpecs}
                  </p>
                </div>
                <div className='flex shrink-0 flex-col items-end gap-1.5'>
                  <StatusPill status={request.status} />
                  <time
                    className='text-xs text-muted-foreground'
                    dateTime={request.createdAt.toISOString()}
                    title={formatDateTime(request.createdAt)}
                  >
                    {formatRelative(request.createdAt)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DataCard>
  )
}
