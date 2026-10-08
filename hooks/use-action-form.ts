import type { DefaultValues, FieldValues, Path } from 'react-hook-form'
import type { z } from 'zod'
import type { FormMode } from '@/components/ui/dialogs'
import type { ActionResult } from '@/lib/actions'

import { zodResolver } from '@hookform/resolvers/zod'
import { get, useForm } from 'react-hook-form'

import { useCloseDialog } from '@/components/ui/dialog-scope'
import { formModeCopy } from '@/components/ui/dialogs'
import { invalidProps } from '@/components/ui/field'
import { toastResult } from '@/lib/action-toast'

/**
 * A react-hook-form form inside a `<FormDialog>` that saves through a Server
 * Action: validates with `schema`, toasts the result, closes on success.
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
}: {
  /** Checked in the browser; the action checks again and transforms. */
  schema: z.ZodType<unknown, T>
  defaultValues: DefaultValues<T>
  /** A Server Action (or a call to one). */
  action: (values: T) => Promise<ActionResult>
  mode: FormMode
  /** Lowercase; also prefixes each field's id (`category-name`). */
  noun: string
}) {
  const close = useCloseDialog()
  const form = useForm<T>({
    // raw: submit the form's own values; the action does the transforming
    resolver: zodResolver(schema, undefined, { raw: true }),
    defaultValues,
  })
  const { errors, isSubmitting } = form.formState
  const { successMessage } = formModeCopy(mode, noun)

  const onSubmit = form.handleSubmit(async values => {
    const result = await action(values)

    if (toastResult(result, successMessage, form.setError)) close()
  })

  /** Id, error wiring and registration for the control of field `name`. */
  const field = (name: Path<T>) => {
    const id = `${noun}-${name}`

    return {
      id,
      ...invalidProps(id, get(errors, name)?.message),
      ...form.register(name),
    }
  }

  return {
    ...form,
    field,
    /** Spread onto `<FormDialog>`. */
    dialog: { mode, noun, pending: isSubmitting, onClose: close, onSubmit },
  }
}
