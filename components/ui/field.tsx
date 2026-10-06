import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const inputClass =
  'w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-700 dark:aria-[invalid=true]:border-red-400'

export const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground'

/** Id of a field's error message; point the control's `aria-describedby` at it. */
export const fieldErrorId = (id: string) => `${id}-error`

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
  className,
  children,
}: {
  id: string
  label: ReactNode
  error?: string
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
