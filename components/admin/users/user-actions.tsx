'use client'

import type { UserRow } from '@/components/admin/users/users-table'
import type { UserFormValues } from '@/lib/schemas/user'

import { useState } from 'react'

import { deleteUser, updateUser } from '@/app/admin/users/actions'
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
      />

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
          >
            {/* AdminLog is onDelete: Cascade until 3.11 makes it SetNull */}
            Their activity log is deleted with them. To keep it, deactivate the
            account instead.
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}
