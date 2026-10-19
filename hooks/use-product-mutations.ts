import type { BulkUpdateData } from '@/components/admin/products/types'

import { addToast } from '@heroui/toast'

import { pluralize } from '@/lib/format'

type Json = Record<string, unknown>

interface Feedback {
  title: string
  success: string
  error: string
}

/** Send a JSON body and normalize the `{ success, error }` envelope. */
async function sendJson(url: string, method: string, body?: Json) {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const data: { success?: boolean; error?: string } = await response
      .json()
      .catch(() => ({}))

    return { ok: response.ok && data.success !== false, data }
  } catch (error) {
    console.error(`${method} ${url} failed:`, error)

    return { ok: false, data: { error: 'Server connection failed' } }
  }
}

/**
 * Admin product mutations. Each call toasts its own outcome, refreshes the
 * product list on success, and resolves to whether it worked.
 */
export function useProductMutations(refresh: () => Promise<unknown> | void) {
  const run = async (
    url: string,
    method: string,
    body: Json | undefined,
    feedback: Feedback,
  ) => {
    const { ok, data } = await sendJson(url, method, body)

    if (ok) await refresh()

    addToast({
      title: ok ? feedback.title : 'Error',
      description: ok ? feedback.success : data.error || feedback.error,
      color: ok ? 'success' : 'danger',
    })

    return ok
  }

  return {
    bulkUpdate: (productIds: string[], updateData: BulkUpdateData) =>
      run(
        '/api/products/bulk',
        'PATCH',
        { productIds, updateData },
        {
          title: 'Updated',
          success: `${pluralize(productIds.length, 'product')} updated`,
          error: 'Could not update products',
        },
      ),

    bulkDelete: (productIds: string[]) =>
      run(
        '/api/products/bulk',
        'DELETE',
        { productIds },
        {
          title: 'Deleted',
          success: `${pluralize(productIds.length, 'product')} removed`,
          error: 'Could not delete products',
        },
      ),
  }
}
