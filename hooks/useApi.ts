import useSWR from 'swr'
import { useState } from 'react'

// Generic fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Types
interface PaginationParams {
  page?: number
  limit?: number
}

interface ProductFilters extends PaginationParams {
  category?: string
  subcategory?: string
  brand?: string
  inStock?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

// Products hooks
export function useProducts(filters?: ProductFilters) {
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
    `/api/products${queryString ? `?${queryString}` : ''}`,
    fetcher,
  )

  return {
    products: data?.success ? data.data.products || [] : [],
    pagination: data?.success ? data.data.pagination : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

export function useProduct(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<any>>(
    id ? `/api/products/${id}` : null,
    fetcher,
  )

  return {
    product: data?.success ? data.data : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = async (productData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create product')
      }

      return result.data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createProduct, isLoading, error }
}

export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProduct = async (id: string, productData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update product')
      }

      return result.data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update product'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { updateProduct, isLoading, error }
}

export function useDeleteProduct() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteProduct = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete product')
      }

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete product'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { deleteProduct, isLoading, error }
}

// Categories hooks
export function useCategories(includeProducts = false) {
  const { data, error, mutate } = useSWR<ApiResponse<any[]>>(
    `/api/categories${includeProducts ? '?includeProducts=true' : ''}`,
    fetcher,
  )

  return {
    categories: data?.success ? data.data : [],
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

export function useCategory(id: string, includeProducts = false) {
  const { data, error, mutate } = useSWR<ApiResponse<any>>(
    id
      ? `/api/categories/${id}${includeProducts ? '?includeProducts=true' : ''}`
      : null,
    fetcher,
  )

  return {
    category: data?.success ? data.data : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

// Manufacturers hooks
export function useManufacturers(
  filters?: PaginationParams & { search?: string },
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
    `/api/manufacturers${queryString ? `?${queryString}` : ''}`,
    fetcher,
  )

  return {
    manufacturers: data?.success ? data.data.manufacturers || [] : [],
    pagination: data?.success ? data.data.pagination : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

export function useManufacturer(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<any>>(
    id ? `/api/manufacturers/${id}` : null,
    fetcher,
  )

  return {
    manufacturer: data?.success ? data.data : null,
    isLoading: !error && !data,
    isError: error || (data && !data.success),
    error: error || (data && !data.success ? data.error : null),
    mutate,
  }
}

// Orders hooks
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
