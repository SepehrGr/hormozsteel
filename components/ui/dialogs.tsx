// Browser code, but deliberately not a 'use client' entry: only client
// components render it, and its function props couldn't cross from a server one.
import type { FormEventHandler, ReactNode } from 'react'

import { useId } from 'react'
import { Plus, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ModalDialog from '@/components/ui/modal-dialog'

export type FormMode = 'create' | 'edit'

/** Title, button labels, success toast and icon for an add/edit dialog. */
export function formModeCopy(mode: FormMode, noun: string) {
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1)

  return mode === 'create'
    ? {
        title: `Add ${noun}`,
        submitLabel: 'Create',
        pendingLabel: 'Creating…',
        successMessage: `${Noun} created`,
        Icon: Plus,
      }
    : {
        title: `Edit ${noun}`,
        submitLabel: 'Save',
        pendingLabel: 'Saving…',
        successMessage: `${Noun} updated`,
        Icon: Save,
      }
}

interface FrameProps {
  title: string
  onClose: () => void
  /** While pending, Escape / backdrop / Cancel can't abandon the request. */
  pending?: boolean
  children: ReactNode
}

/** Title bar + close button around a ModalDialog. Mount only while open. */
function DialogFrame({ title, onClose, pending, children }: FrameProps) {
  const titleId = useId()

  return (
    <ModalDialog
      className='max-h-[90vh] w-full max-w-lg overflow-y-auto'
      dismissable={!pending}
      labelledBy={titleId}
      onClose={onClose}
    >
      <div className='flex items-center justify-between border-b border-border px-5 py-3'>
        <h2
          className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          id={titleId}
        >
          {title}
        </h2>
        <Button
          aria-label='Close'
          disabled={pending}
          size='icon'
          variant='outline'
          onClick={onClose}
        >
          <X aria-hidden className='h-4 w-4' />
        </Button>
      </div>
      {children}
    </ModalDialog>
  )
}

function DialogFooter({
  onCancel,
  pending,
  children,
}: {
  onCancel: () => void
  pending?: boolean
  children: ReactNode
}) {
  return (
    <div className='flex justify-end gap-2 border-t border-border px-5 py-4'>
      <Button disabled={pending} variant='outline' onClick={onCancel}>
        Cancel
      </Button>
      {children}
    </div>
  )
}

/**
 * Dialog whose body is a form; Enter submits, the footer has Cancel + submit.
 *
 * ```tsx
 * {open && (
 *   <FormDialog title='Edit category' pending={isSubmitting}
 *     onClose={close} onSubmit={handleSubmit(save)}>
 *     ...fields
 *   </FormDialog>
 * )}
 * ```
 */
export function FormDialog({
  title,
  onClose,
  onSubmit,
  pending,
  submitLabel = 'Save',
  pendingLabel = 'Saving…',
  submitIcon,
  children,
}: FrameProps & {
  onSubmit: FormEventHandler<HTMLFormElement>
  submitLabel?: string
  pendingLabel?: string
  submitIcon?: ReactNode
}) {
  return (
    <DialogFrame pending={pending} title={title} onClose={onClose}>
      {/* noValidate: zod owns validation and renders its own messages */}
      <form noValidate onSubmit={onSubmit}>
        <div className='space-y-4 px-5 py-5'>{children}</div>
        <DialogFooter pending={pending} onCancel={onClose}>
          <Button disabled={pending} type='submit'>
            {submitIcon}
            {pending ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogFrame>
  )
}

/** Destructive yes/no confirmation; `children` explains what will happen. */
export function ConfirmDialog({
  title,
  onClose,
  onConfirm,
  pending,
  confirmLabel = 'Delete',
  pendingLabel = 'Deleting…',
  confirmIcon,
  confirmDisabled,
  children,
}: FrameProps & {
  onConfirm: () => void
  confirmLabel?: string
  pendingLabel?: string
  confirmIcon?: ReactNode
  /** Blocks only the confirm button (e.g. the action can't succeed); Cancel stays usable. */
  confirmDisabled?: boolean
}) {
  return (
    <DialogFrame pending={pending} title={title} onClose={onClose}>
      <div className='space-y-3 px-5 py-5 text-sm text-muted-foreground'>
        {children}
      </div>
      <DialogFooter pending={pending} onCancel={onClose}>
        <Button
          disabled={pending || confirmDisabled}
          variant='danger'
          onClick={onConfirm}
        >
          {confirmIcon}
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogFrame>
  )
}
