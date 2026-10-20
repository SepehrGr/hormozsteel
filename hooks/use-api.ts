import type { InboxNotifications } from '@/types'

import useSWR from 'swr'
import { useState } from 'react'

// Generic fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Types
interface PaginationParams {
  page?: number
  limit?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PaginatedResponse<T> {
  success: boolean
  data: {
    products?: T[]
    manufacturers?: T[]
    orders?: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
  error?: string
}

export function useOrders(
  filters?: PaginationParams & {
    status?: string
    customerId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  },
) {
  const queryString = filters
    ? new URLSearchParams(
        Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = value.toString()
            }

            return acc
          },
          {} as Record<string, string>,
        ),
      ).toString()
    : ''

  const { data, error, mutate } = useSWR<PaginatedResponse<any>>(
    `/api/orders${queryString ? `?${queryString}` : ''}`,
    fetcher,
  )

  return {
    orders: data?.success ? data.data.orders || [] : [],
    pagination: data?.success ? data.data.pagination : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

export function useCreateOrder() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async (orderData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order')
      }

      return result.data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create order'

      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createOrder, isLoading, error }
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
