import type { Role } from '@/lib/schemas/user'

import { UserRound } from 'lucide-react'

import {
  type Column,
  AdminTable,
  NameCell,
  rowClass,
} from '@/components/admin/admin-table'
import { Pill } from '@/components/admin/pill'
import { formatDateTime } from '@/lib/format'
import { ROLE_LABELS } from '@/lib/schemas/user'

export interface UserRow {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
  /** Set only while the lock is still running; the page clears expired ones. */
  lockedUntil: Date | null
}

const columns: Column[] = [
  { label: 'User' },
  { label: 'Role' },
  { label: 'Status' },
  { label: 'Last login' },
  { label: 'Created' },
]

/** Admin accounts with their role, status, and lockout. */
export function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <AdminTable columns={columns}>
      {users.map(user => (
        <tr key={user.id} className={rowClass}>
          <td className='px-4 py-3'>
            <NameCell
              description={user.email}
              media={<UserRound aria-hidden className='h-4 w-4' />}
              name={user.name}
            />
          </td>
          <td className='px-4 py-3'>
            <Pill tone={user.role === 'SUPER_ADMIN' ? 'strong' : 'neutral'}>
              {ROLE_LABELS[user.role]}
            </Pill>
          </td>
          <td className='px-4 py-3'>
            <div className='flex flex-wrap items-center gap-1'>
              <Pill tone={user.isActive ? 'success' : 'neutral'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Pill>
              {user.lockedUntil ? <Pill tone='danger'>Locked</Pill> : null}
            </div>
            {user.lockedUntil ? (
              <p className='mt-1 text-xs text-muted-foreground'>
                Until {formatDateTime(user.lockedUntil)}
              </p>
            ) : null}
          </td>
          <td className='px-4 py-3 text-muted-foreground'>
            {formatDateTime(user.lastLogin)}
          </td>
          <td className='px-4 py-3 text-muted-foreground'>
            {formatDateTime(user.createdAt)}
          </td>
        </tr>
      ))}
    </AdminTable>
  )
}
