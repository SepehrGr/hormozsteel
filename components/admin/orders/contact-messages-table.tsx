import type { ContactForm } from '@prisma/client'

import {
  type Column,
  AdminTable,
  rowClass,
} from '@/components/admin/admin-table'
import { StatusPill } from '@/components/admin/pill'
import { formatDateTime } from '@/lib/format'

const columns: Column[] = [
  { label: 'From' },
  { label: 'Message' },
  { label: 'Status' },
  { label: 'Received' },
]

/** Messages from the public contact form. */
export function ContactMessagesTable({
  messages,
}: {
  messages: ContactForm[]
}) {
  return (
    <AdminTable columns={columns}>
      {messages.map(message => (
        <tr key={message.id} className={rowClass}>
          <td className='px-4 py-3'>
            <p className='font-medium text-foreground'>{message.name}</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {[message.phone, message.email].filter(Boolean).join(' · ')}
            </p>
          </td>
          <td className='px-4 py-3'>
            <p className='line-clamp-2 max-w-md text-muted-foreground'>
              {message.message}
            </p>
          </td>
          <td className='px-4 py-3'>
            <StatusPill status={message.status} />
          </td>
          <td className='px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground'>
            {formatDateTime(message.createdAt)}
          </td>
        </tr>
      ))}
    </AdminTable>
  )
}
