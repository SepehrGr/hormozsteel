import type { Role } from '@/lib/schemas/user'

import { UserRound } from 'lucide-react'

import {
  type Column,
  actionsColumn,
  AdminTable,
  NameCell,
} from '@/components/admin/admin-table'
import { Pill } from '@/components/admin/pill'
import { UserActions } from '@/components/admin/users/user-actions'
import { isDemoAccount } from '@/lib/demo'
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

/** Admin accounts with their role, status, and lockout. */
export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[]
  /** The signed-in admin, whose own row can't change its role or status. */
  currentUserId: string
}) {
  const columns: Column<UserRow>[] = [
    {
      label: 'User',
      narrow: 'title',
      cell: user => (
        <NameCell
          description={user.email}
          media={<UserRound aria-hidden className='h-4 w-4' />}
          name={
            isDemoAccount(user.email) ? (
              <span className='inline-flex flex-wrap items-center gap-2'>
                {user.name}
                <span title="A shared demo login: it can't be edited or deleted here.">
                  <Pill tone='info'>Demo · protected</Pill>
                </span>
              </span>
            ) : (
              user.name
            )
          }
        />
      ),
    },
    {
      label: 'Role',
      narrow: 'summary',
      cell: user => <Pill>{ROLE_LABELS[user.role]}</Pill>,
    },
    {
      label: 'Status',
      cell: user => (
        <div>
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
        </div>
      ),
    },
    {
      label: 'Last login',
      cellClassName: 'text-muted-foreground',
      cell: user => formatDateTime(user.lastLogin),
    },
    {
      label: 'Created',
      cellClassName: 'text-muted-foreground',
      cell: user => formatDateTime(user.createdAt),
    },
    actionsColumn(user => (
      <UserActions isSelf={user.id === currentUserId} user={user} />
    )),
  ]

  return (
    <AdminTable
      columns={columns}
      rowLabel={user => `Details of ${user.name}`}
      rows={users}
    />
  )
}
