'use client'

import type { UserRow } from '@/components/admin/users/users-table'
import type { UserFormValues } from '@/lib/schemas/user'

import { useState, useTransition } from 'react'
import { LockOpen } from 'lucide-react'

import { deleteUser, unlockUser, updateUser } from '@/app/admin/users/actions'
import { RowActions } from '@/components/admin/admin-table'
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { toastResult } from '@/lib/action-toast'

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
  const [unlocking, startUnlock] = useTransition()

  // No confirm step: unlocking only gives back sign-in the lock took away
  const unlock = () =>
    startUnlock(async () => {
      toastResult(await unlockUser({ id: user.id }), `${user.name} unlocked`)
    })

  return (
    <>
      <RowActions
        name={user.name}
        onDelete={isSelf ? undefined : () => setOpen('delete')}
        onEdit={() => setOpen('edit')}
      >
        {user.lockedUntil ? (
          <Button
            aria-label={`Unlock ${user.name}`}
            disabled={unlocking}
            size='icon'
            variant='outline'
            onClick={unlock}
          >
            <LockOpen aria-hidden className='h-3.5 w-3.5' />
          </Button>
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
          >
            Their activity log is kept, but no longer shows who made those
            changes. To keep that, deactivate the account instead.
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}
