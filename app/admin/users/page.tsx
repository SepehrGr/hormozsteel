import { Lock, Shield, ShieldCheck, UserCheck, Users } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { PageHeader } from '@/components/admin/page-header'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { createUser } from '@/app/admin/users/actions'
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
import { UsersTable } from '@/components/admin/users/users-table'
import { DialogButton } from '@/components/ui/dialog-button'
import { Select } from '@/components/ui/field'
import { requireSuperAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { ROLE_LABELS, ROLES } from '@/lib/schemas/user'
import { matchesSearch } from '@/lib/utils'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; role?: string | string[] }>
}) {
  // Here, not only in the layout: layouts don't re-run on every navigation,
  // so the check sits next to the data it protects
  const session = await requireSuperAdmin()

  const { q, role: roleParam } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''
  // Anything that isn't a real role (a typo, `?role=ROOT`) means "all roles"
  const role = ROLES.find(r => r === roleParam)

  const users = await prisma.user.findMany({
    // Never the password hash
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      lockedUntil: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // A lock that has run out stays in the row until the next login clears it
  const now = new Date()
  const rows = users.map(user => ({
    ...user,
    lockedUntil:
      user.lockedUntil && user.lockedUntil > now ? user.lockedUntil : null,
  }))

  // Filtered here rather than in SQL so the stats still count everyone.
  // ponytail: fine for a handful of admins; move into `where` if that grows.
  const visible = rows.filter(
    user =>
      (!role || user.role === role) &&
      matchesSearch(query, [user.name, user.email]),
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={
          <DialogButton label='Add user'>
            <UserFormDialog action={createUser} mode='create' />
          </DialogButton>
        }
        description='Who can sign in to this admin, and what they can change.'
        icon={Shield}
        title='Admin users'
      />

      <StatsBoard
        stats={[
          { label: 'Accounts', value: rows.length, icon: Users },
          {
            label: 'Active',
            value: rows.filter(u => u.isActive).length,
            icon: UserCheck,
          },
          {
            label: 'Super admins',
            value: rows.filter(u => u.role === 'SUPER_ADMIN').length,
            icon: ShieldCheck,
          },
          {
            label: 'Locked',
            value: rows.filter(u => u.lockedUntil).length,
            icon: Lock,
          },
        ]}
      />

      <SearchToolbar
        filtered={Boolean(role)}
        path='/admin/users'
        placeholder='Search name or email…'
        query={query}
      >
        {/* key resets the uncontrolled select when the URL changes */}
        <Select
          key={role}
          aria-label='Role'
          className='sm:w-44'
          defaultValue={role ?? ''}
          name='role'
        >
          <option value=''>All roles</option>
          {ROLES.map(r => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </SearchToolbar>

      <DataCard icon={Users} title={`Accounts (${visible.length})`}>
        {visible.length > 0 ? (
          <UsersTable currentUserId={session.user.id} users={visible} />
        ) : (
          // You're always in the list, so an empty table means the filters hid everyone
          <EmptyState
            description='Try a different search or role.'
            icon={Users}
            title='No users match these filters'
          />
        )}
      </DataCard>
    </div>
  )
}
