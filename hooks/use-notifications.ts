import type { ActionResult } from '@/lib/actions'
import type { InboxNotifications } from '@/types'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// The admin bell's inbox summary, polled every 30 s
export function useNotifications() {
  const { data, isLoading } = useSWR<ActionResult<InboxNotifications>>(
    '/api/admin/notifications',
    fetcher,
    { refreshInterval: 30_000 },
  )

  return { notifications: data?.success ? data.data : null, isLoading }
}
