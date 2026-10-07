import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ActionResult } from '@/lib/actions'

import { addToast } from '@heroui/toast'

/**
 * Toast a Server Action's outcome. On failure, zod field errors are pushed
 * into the form (when `setError` is given) so they render under each field.
 * Returns true on success, narrowing `result` to its data branch.
 *
 * ```ts
 * const result = await updateCategory({ id, ...values })
 * if (toastResult(result, 'Category updated', form.setError)) close()
 * ```
 */
export function toastResult<T, F extends FieldValues = FieldValues>(
  result: ActionResult<T>,
  successMessage: string,
  setError?: UseFormSetError<F>,
): result is Extract<ActionResult<T>, { success: true }> {
  if (result.success) {
    addToast({ title: 'Done', description: successMessage, color: 'success' })

    return true
  }

  for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
    if (messages?.[0]) setError?.(field as Path<F>, { message: messages[0] })
  }
  addToast({ title: 'Error', description: result.error, color: 'danger' })

  return false
}
