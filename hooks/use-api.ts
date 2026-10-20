import type { InboxNotifications } from '@/types'

import useSWR from 'swr'

// Generic fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// The admin bell's inbox summary, polled every 30 s
export function useNotifications() {
  const { data, isLoading } = useSWR<ApiResponse<InboxNotifications>>(
    '/api/admin/notifications',
    fetcher,
    { refreshInterval: 30_000 },
  )

  return { notifications: data?.success ? data.data : null, isLoading }
}
