'use client'

import type { UserRow } from '@/components/admin/users/users-table'
import type { UserFormValues } from '@/lib/schemas/user'

import { useState } from 'react'

import { updateUser } from '@/app/admin/users/actions'
import { RowActions } from '@/components/admin/admin-table'
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
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
 * rest of the table (dates included) stays server-rendered.
 */
export function UserActions({
  user,
  isSelf,
}: {
  user: UserRow
  /** The signed-in admin's own row. */
  isSelf: boolean
}) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <RowActions name={user.name} onEdit={() => setEditing(true)} />

      {editing ? (
        <DialogScope onClose={() => setEditing(false)}>
          <UserFormDialog
            action={values => updateUser({ id: user.id, values })}
            defaultValues={toFormValues(user)}
            isSelf={isSelf}
            mode='edit'
          />
        </DialogScope>
      ) : null}
    </>
  )
}
