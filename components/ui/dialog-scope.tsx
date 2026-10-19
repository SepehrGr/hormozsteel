// Browser code, but deliberately not a 'use client' entry: only client
// components render it, and its function props couldn't cross from a server one.
import type { ReactNode } from 'react'

import { createContext, use } from 'react'

const CloseDialog = createContext<(() => void) | null>(null)

/** Close the dialog this component is rendered in; null outside one. */
export const useMaybeCloseDialog = () => use(CloseDialog)

/** Close the dialog this component is rendered in. */
export function useCloseDialog() {
  const close = useMaybeCloseDialog()

  if (!close) {
    throw new Error(
      'useCloseDialog() needs a <DialogButton> or <DialogScope> above it',
    )
  }

  return close
}

/** Lets the dialog inside it close itself; for dialogs opened from state. */
export function DialogScope({
  onClose,
  children,
}: {
  onClose: () => void
  children: ReactNode
}) {
  return <CloseDialog value={onClose}>{children}</CloseDialog>
}
