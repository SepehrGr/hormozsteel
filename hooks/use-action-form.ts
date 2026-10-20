import type { DefaultValues, FieldValues, Path } from 'react-hook-form'
import type { z } from 'zod'
import type { FormMode } from '@/components/ui/dialogs'
import type { ActionResult } from '@/lib/actions'

import { zodResolver } from '@hookform/resolvers/zod'
import { get, useForm } from 'react-hook-form'

import { useMaybeCloseDialog } from '@/components/ui/dialog-scope'
import { formModeCopy } from '@/components/ui/dialogs'
import { invalidProps } from '@/components/ui/field'
import { toastResult } from '@/lib/action-toast'

/**
 * A react-hook-form form inside a `<FormDialog>` that saves through a Server
 * Action: validates with `schema`, toasts the result, closes on success.
 * On a page, pass `onSuccess` and submit with the returned `onSubmit`.
 *
 * ```tsx
 * const { field, formState, dialog } = useActionForm({
 *   schema: categorySchema, defaultValues, action, mode, noun: 'category' })
 *
 * <FormDialog {...dialog}>
 *   <FormField id='category-name' error={formState.errors.name?.message} label='Name'>
 *     <Input {...field('name')} />
 *   </FormField>
 * </FormDialog>
 * ```
 */
export function useActionForm<T extends FieldValues>({
  schema,
  defaultValues,
  action,
  mode,
  noun,
  successMessage,
  onSuccess,
}: {
  /** Checked in the browser; the action checks again and transforms. */
  schema: z.ZodType<unknown, T>
  defaultValues: DefaultValues<T>
  /** A Server Action (or a call to one). */
  action: (values: T) => Promise<ActionResult<unknown>>
  mode: FormMode
  /** Lowercase; also prefixes each field's id (`category-name`). */
  noun: string
  /** Overrides the mode's toast, e.g. "Request sent". */
  successMessage?: string
  /** Runs after a save instead of closing the dialog. */
  onSuccess?: (values: T) => void
}) {
  const close = useMaybeCloseDialog()
  const form = useForm<T>({
    // raw: submit the form's own values; the action does the transforming
    resolver: zodResolver(schema, undefined, { raw: true }),
    defaultValues,
  })
  const { errors, isSubmitting, isDirty } = form.formState
  const toast = successMessage ?? formModeCopy(mode, noun).successMessage

  const onSubmit = form.handleSubmit(async values => {
    const result = await action(values)

    if (!toastResult(result, toast, form.setError)) return
    if (onSuccess) onSuccess(values)
    else close?.()
  })

  /**
   * Id, error wiring and registration for the control of field `name`;
   * `hint: true` when its `<FormField>` has a hint.
   */
  const field = (name: Path<T>, { hint = false } = {}) => {
    const id = `${noun}-${name}`

    return {
      id,
      ...invalidProps(id, get(errors, name)?.message, hint),
      ...form.register(name),
    }
  }

  return {
    ...form,
    field,
    onSubmit,
    /** Spread onto `<FormDialog>`. */
    dialog: {
      mode,
      noun,
      pending: isSubmitting,
      dirty: isDirty,
      onClose: () => close?.(),
      onSubmit,
    },
  }
}
