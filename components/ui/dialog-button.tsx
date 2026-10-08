'use client'

import type { ReactNode } from 'react'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogScope } from '@/components/ui/dialog-scope'

/**
 * A button that opens the dialog given as `children`. Usable from server
 * components: the dialog element is described on the server, mounted here only
 * while open, and closes itself with `useCloseDialog()`.
 *
 * ```tsx
 * <DialogButton label='Add category'>
 *   <CategoryFormDialog mode='create' action={createCategory} />
 * </DialogButton>
 * ```
 */
export function DialogButton({
  label,
  icon = <Plus aria-hidden className='h-4 w-4' />,
  children,
}: {
  label: string
  icon?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>
      {open ? (
        <DialogScope onClose={() => setOpen(false)}>{children}</DialogScope>
      ) : null}
    </>
  )
}
