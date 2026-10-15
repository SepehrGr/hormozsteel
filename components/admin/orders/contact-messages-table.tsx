import type { ContactForm } from '@prisma/client'

import { MailOpen, Reply } from 'lucide-react'

import {
  deleteContactMessage,
  updateContactStatus,
} from '@/app/admin/orders/actions'
import { ActionButton } from '@/components/admin/action-button'
import {
  type Column,
  AdminTable,
  expandColumn,
} from '@/components/admin/admin-table'
import { DeleteRowButton } from '@/components/admin/delete-row-button'
import { ExpandableRow } from '@/components/admin/expandable-row'
import { StatusPill } from '@/components/admin/pill'
import { formatDateTime } from '@/lib/format'

const columns: Column[] = [
  expandColumn,
  { label: 'From' },
  { label: 'Message' },
  { label: 'Status' },
  { label: 'Received' },
  { label: 'Actions', className: 'text-right' },
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
        <ExpandableRow
          key={message.id}
          colSpan={columns.length}
          detail={<MessageDetails message={message} />}
          label={`Full message from ${message.name}`}
        >
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
          <td className='px-4 py-3'>
            <DeleteRowButton
              action={deleteContactMessage.bind(null, { id: message.id })}
              name={message.name}
              noun='message'
            >
              {message.status === 'NEW' ? (
                <ActionButton
                  action={updateContactStatus.bind(null, {
                    id: message.id,
                    status: 'READ',
                  })}
                  label={`Mark ${message.name}'s message read`}
                  success={`${message.name}'s message marked read`}
                >
                  <MailOpen aria-hidden className='h-3.5 w-3.5' />
                </ActionButton>
              ) : null}
              {message.status !== 'REPLIED' ? (
                <ActionButton
                  action={updateContactStatus.bind(null, {
                    id: message.id,
                    status: 'REPLIED',
                  })}
                  label={`Mark ${message.name}'s message replied`}
                  success={`${message.name}'s message marked replied`}
                >
                  <Reply aria-hidden className='h-3.5 w-3.5' />
                </ActionButton>
              ) : null}
            </DeleteRowButton>
          </td>
        </ExpandableRow>
      ))}
    </AdminTable>
  )
}

function MessageDetails({ message }: { message: ContactForm }) {
  return (
    <div className='max-w-3xl space-y-2'>
      <p className='whitespace-pre-line text-foreground'>{message.message}</p>
      {message.repliedAt ? (
        <p className='font-mono text-xs tabular-nums text-muted-foreground'>
          Replied {formatDateTime(message.repliedAt)}
        </p>
      ) : null}
    </div>
  )
}
