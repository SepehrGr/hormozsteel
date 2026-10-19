// Browser code, but deliberately not a 'use client' entry: only client
// components render it, and its function props couldn't cross from a server one.
import type { ComponentProps, FormEventHandler, ReactNode } from 'react'

import { useId } from 'react'
import { Plus, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ModalDialog from '@/components/ui/modal-dialog'
import { capitalize } from '@/lib/format'
import { cn } from '@/lib/utils'

export type FormMode = 'create' | 'edit'

/** Title, button labels, success toast and icon for an add/edit dialog. */
export function formModeCopy(mode: FormMode, noun: string) {
  return mode === 'create'
    ? {
        title: `Add ${noun}`,
        submitLabel: `Add ${noun}`,
        pendingLabel: 'Adding…',
        successMessage: `${capitalize(noun)} added`,
        Icon: Plus,
      }
    : {
        title: `Edit ${noun}`,
        submitLabel: 'Save',
        pendingLabel: 'Saving…',
        successMessage: `${capitalize(noun)} updated`,
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

/**
 * Title bar + close button around a ModalDialog. Mount only while open.
 * On phones it's a sheet: `full` height for forms, or anchored to the `bottom`.
 */
function DialogFrame({
  title,
  onClose,
  pending,
  sheet,
  children,
  ...modal
}: FrameProps & { sheet: 'full' | 'bottom' } & Pick<
    ComponentProps<typeof ModalDialog>,
    'describedBy' | 'role' | 'closeOnBackdrop'
  >) {
  const titleId = useId()

  return (
    <ModalDialog
      className={cn(
        'max-h-[90vh] w-full max-w-lg overflow-y-auto',
        'max-sm:max-w-none max-sm:border-x-0 max-sm:transition-transform max-sm:duration-200 max-sm:ease-out max-sm:starting:translate-y-full motion-reduce:transition-none',
        sheet === 'full'
          ? 'max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:border-y-0 max-sm:open:flex max-sm:open:flex-col'
          : 'max-sm:mb-0 max-sm:max-h-[85dvh] max-sm:border-b-0',
      )}
      dismissable={!pending}
      labelledBy={titleId}
      onClose={onClose}
      {...modal}
    >
      <div className='sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3'>
        <h2
          className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'
          id={titleId}
        >
          {title}
        </h2>
        <Button
          aria-label='Close'
          className='pointer-coarse:h-11 pointer-coarse:w-11'
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

/** Cancel + action buttons: right-aligned, stacked full width on phones (action on top). */
export const buttonRowClass =
  'flex flex-col-reverse gap-2 max-sm:*:h-11 sm:flex-row sm:justify-end'

function DialogFooter({
  onCancel,
  pending,
  cancelLabel = 'Cancel',
  focusCancel = false,
  children,
}: {
  onCancel: () => void
  pending?: boolean
  cancelLabel?: string
  /** Start on Cancel, so Enter right after opening can't confirm. */
  focusCancel?: boolean
  children: ReactNode
}) {
  return (
    // Phones stack the buttons, action on top; the DOM keeps Cancel first for tab order
    <div
      className={cn(
        buttonRowClass,
        'sticky bottom-0 border-t border-border bg-card px-5 py-4',
      )}
    >
      <Button
        data-autofocus={focusCancel || undefined}
        disabled={pending}
        variant='outline'
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      {children}
    </div>
  )
}

/**
 * Add/edit dialog whose body is a form; Enter submits, the footer has Cancel +
 * submit. Usually given `{...dialog}` from `useActionForm`.
 */
export function FormDialog({
  mode,
  noun,
  submitLabel,
  pendingLabel,
  onClose,
  onSubmit,
  pending,
  dirty,
  children,
}: Omit<FrameProps, 'title'> & {
  mode: FormMode
  /** Lowercase, as in "Add category". */
  noun: string
  /** Overrides the mode's wording, e.g. "Apply to 3 products". */
  submitLabel?: string
  pendingLabel?: string
  onSubmit: FormEventHandler<HTMLFormElement>
  /** Has unsaved edits: a backdrop click then doesn't close it. */
  dirty?: boolean
}) {
  const copy = formModeCopy(mode, noun)

  return (
    <DialogFrame
      closeOnBackdrop={!dirty}
      pending={pending}
      sheet='full'
      title={copy.title}
      onClose={onClose}
    >
      {/* noValidate: zod owns validation and renders its own messages */}
      <form
        noValidate
        className='max-sm:flex max-sm:flex-1 max-sm:flex-col'
        onSubmit={onSubmit}
      >
        <div className='space-y-4 px-5 py-5 max-sm:flex-1'>{children}</div>
        <DialogFooter pending={pending} onCancel={onClose}>
          <Button className='sm:min-w-28' disabled={pending} type='submit'>
            <copy.Icon aria-hidden className='h-4 w-4' />
            {pending
              ? (pendingLabel ?? copy.pendingLabel)
              : (submitLabel ?? copy.submitLabel)}
          </Button>
        </DialogFooter>
      </form>
    </DialogFrame>
  )
}

/**
 * Destructive yes/no confirmation; `children` explains what will happen and
 * is read out when it opens. Starts on Cancel.
 */
export function ConfirmDialog({
  title,
  onClose,
  onConfirm,
  pending,
  confirmLabel,
  pendingLabel,
  confirmIcon,
  blockedAction,
  children,
}: FrameProps & {
  onConfirm: () => void
  /** Names the action and its object, e.g. "Yes, delete the product". */
  confirmLabel: string
  pendingLabel: string
  confirmIcon?: ReactNode
  /**
   * Set when the action can't go ahead: replaces the confirm button (e.g. a
   * link to fix what blocks it), and Cancel reads "Close".
   */
  blockedAction?: ReactNode
}) {
  const bodyId = useId()

  return (
    <DialogFrame
      describedBy={bodyId}
      pending={pending}
      role='alertdialog'
      sheet='bottom'
      title={title}
      onClose={onClose}
    >
      <div
        className='space-y-3 px-5 py-5 text-sm text-muted-foreground'
        id={bodyId}
      >
        {children}
      </div>
      <DialogFooter
        focusCancel
        cancelLabel={blockedAction ? 'Close' : 'Cancel'}
        pending={pending}
        onCancel={onClose}
      >
        {blockedAction ?? (
          <Button
            className='sm:min-w-28'
            disabled={pending}
            variant='danger'
            onClick={onConfirm}
          >
            {confirmIcon}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        )}
      </DialogFooter>
    </DialogFrame>
  )
}
