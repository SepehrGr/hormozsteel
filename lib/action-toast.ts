import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ActionResult } from '@/lib/actions'

import { addToast } from '@heroui/toast'
import { mutate } from 'swr'

/**
 * Toast a Server Action's outcome; the success message can be built from the
 * action's data. On success, every SWR poll (the admin bell)
 * refetches, since the write may have changed it. On failure, zod field errors
 * are pushed into the form (when `setError` is given) so they render under
 * each field.
 * Returns true on success, narrowing `result` to its data branch.
 *
 * ```ts
 * const result = await updateCategory({ id, ...values })
 * if (toastResult(result, 'Category updated', form.setError)) close()
 * ```
 */
export function toastResult<T, F extends FieldValues = FieldValues>(
  result: ActionResult<T>,
  successMessage: string | ((data: T) => string),
  setError?: UseFormSetError<F>,
): result is Extract<ActionResult<T>, { success: true }> {
  if (result.success) {
    void mutate(() => true)
    addToast({
      title: 'Done',
      description:
        typeof successMessage === 'function'
          ? successMessage(result.data)
          : successMessage,
      color: 'success',
    })

    return true
  }

  for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
    if (messages?.[0]) setError?.(field as Path<F>, { message: messages[0] })
  }
  addToast({ title: 'Error', description: result.error, color: 'danger' })

  return false
}
