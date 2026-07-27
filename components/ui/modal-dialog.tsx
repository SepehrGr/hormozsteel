'use client'

import type { ReactNode } from 'react'

import { useEffect, useRef } from 'react'

interface ModalDialogProps {
  /** Id of the heading that names the dialog. */
  labelledBy: string
  onClose: () => void
  /** Size/scroll classes for the panel; the shell supplies chrome and backdrop. */
  className?: string
  /** False while a request is in flight, so a stray Escape can't abandon it. */
  dismissable?: boolean
  children: ReactNode
}

/**
 * Native <dialog> shell. `showModal()` supplies focus trapping, Escape handling,
 * and background inertness — none of which a div with role='dialog' gets, and all
 * of which are tedious to hand-roll correctly.
 *
 * Mount only while open: callers keep their `if (!isOpen) return null` guard, so
 * modal bodies are never evaluated against half-filled state.
 */
export default function ModalDialog({
  labelledBy,
  onClose,
  className = '',
  dismissable = true,
  children,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Read through a ref so the listeners below never need re-registering
  const dismissableRef = useRef(dismissable)

  dismissableRef.current = dismissable

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    if (!dialog.open) dialog.showModal()

    // A click landing on the dialog itself came from the ::backdrop.
    // close() fires the native close event, which onClose turns into the prop call.
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog && dismissableRef.current) dialog.close()
    }

    // Escape fires 'cancel' before 'close'; block it while work is in flight
    const handleCancel = (e: Event) => {
      if (!dismissableRef.current) e.preventDefault()
    }

    dialog.addEventListener('click', handleBackdropClick)
    dialog.addEventListener('cancel', handleCancel)

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      dialog.removeEventListener('click', handleBackdropClick)
      dialog.removeEventListener('cancel', handleCancel)
      document.body.style.overflow = previousOverflow
      // Unmounting removes the dialog before the browser can hand focus back
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className={`m-auto border border-border bg-card p-0 text-foreground shadow-sm backdrop:bg-black/50 ${className}`}
      dir='ltr'
      onClose={onClose}
    >
      {children}
    </dialog>
  )
}
