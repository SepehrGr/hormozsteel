'use client'

import type { UserRow } from '@/components/admin/users/users-table'
import type { UserFormValues } from '@/lib/schemas/user'

import { useState } from 'react'
import { LockOpen } from 'lucide-react'

import { deleteUser, unlockUser, updateUser } from '@/app/admin/users/actions'
import { ActionButton } from '@/components/admin/action-button'
import { RowActions } from '@/components/admin/admin-table'
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'

/** A database row in the shape the user form holds; the password starts blank. */
function toFormValues(user: UserRow): UserFormValues {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    password: '',
  }
}

/**
 * The buttons in one user's row. Only this cell runs in the browser, so the
 * rest of the table (dates included) stays server-rendered. Your own row has
 * no Delete, mirroring the server's guard.
 */
export function UserActions({
  user,
  isSelf,
}: {
  user: UserRow
  /** The signed-in admin's own row. */
  isSelf: boolean
}) {
  // One value, not two booleans, so both dialogs can't be open at once
  const [open, setOpen] = useState<'edit' | 'delete' | null>(null)
  const close = () => setOpen(null)

  return (
    <>
      <RowActions
        name={user.name}
        onDelete={isSelf ? undefined : () => setOpen('delete')}
        onEdit={() => setOpen('edit')}
      >
        {user.lockedUntil ? (
          <ActionButton
            action={() => unlockUser({ id: user.id })}
            label={`Unlock ${user.name}`}
            success={`${user.name} unlocked`}
          >
            <LockOpen aria-hidden className='h-3.5 w-3.5' />
          </ActionButton>
        ) : null}
      </RowActions>

      {open === 'edit' ? (
        <DialogScope onClose={close}>
          <UserFormDialog
            action={values => updateUser({ id: user.id, values })}
            defaultValues={toFormValues(user)}
            isSelf={isSelf}
            mode='edit'
          />
        </DialogScope>
      ) : null}
      {open === 'delete' ? (
        <DialogScope onClose={close}>
          <DeleteDialog
            action={() => deleteUser({ id: user.id })}
            name={user.name}
            noun='user'
          />
        </DialogScope>
      ) : null}
    </>
  )
}
