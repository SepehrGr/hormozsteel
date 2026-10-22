import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const inputClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50 [&[readonly]]:cursor-not-allowed [&[readonly]]:opacity-50 aria-[invalid=true]:border-red-700 dark:aria-[invalid=true]:border-red-400'

/** A `<label>` around an `sr-only` radio, styled as one button of a choice group. */
export const choiceClass =
  'flex cursor-pointer items-center gap-2 border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/50 has-checked:border-foreground has-checked:bg-muted has-checked:text-foreground has-focus-visible:ring-1 has-focus-visible:ring-foreground'

export const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

/** Id of a field's error message; point the control's `aria-describedby` at it. */
export const fieldErrorId = (id: string) => `${id}-error`

/** Id of a field's hint, shown under it while there's no error. */
export const fieldHintId = (id: string) => `${id}-hint`

/**
 * Spread onto a control: marks it invalid and links it to its error message,
 * or to its hint (`hint: true`) while there's no error.
 */
export const invalidProps = (id: string, message?: string, hint = false) => ({
  'aria-invalid': !!message,
  'aria-describedby': message
    ? fieldErrorId(id)
    : hint
      ? fieldHintId(id)
      : undefined,
})

/**
 * Label + control + validation message.
 *
 * ```tsx
 * <FormField id='name' label='Name' error={errors.name?.message}>
 *   <Input id='name' aria-invalid={!!errors.name} {...register('name')} />
 * </FormField>
 * ```
 */
export function FormField({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: ReactNode
  error?: string
  /** Help under the control; the error replaces it. */
  hint?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p
          className='mt-1 text-xs text-red-700 dark:text-red-400'
          id={fieldErrorId(id)}
          role='alert'
        >
          {error}
        </p>
      ) : hint ? (
        <p className='mt-1 text-xs text-muted-foreground' id={fieldHintId(id)}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

// React 19 passes `ref` through as a prop, so react-hook-form's `register`
// works on these without forwardRef.

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(inputClass, className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(inputClass, 'resize-y', className)} {...props} />
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(inputClass, 'cursor-pointer', className)}
      {...props}
    />
  )
}
