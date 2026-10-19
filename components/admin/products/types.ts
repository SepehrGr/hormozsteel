import { addToast } from '@heroui/toast'

/** Fields the bulk-edit modal can push onto every selected product. */
export interface BulkUpdateData {
  price?: number
  inStock?: boolean
  categoryId?: string
}

/** A category as the filters and product forms need it. */
export interface CategoryOption {
  id: string
  name: string
  slug: string
  subcategories: string[]
}

/** A mill (manufacturer) as the product forms need it. */
export interface MillOption {
  id: string
  name: string
}

/** Shape of the add/edit product forms. */
export interface ProductFormData {
  name: string
  brand: string
  manufacturerId?: string
  size: string
  price: number
  inStock: boolean
  categoryId: string
  subcategory: string
  weight?: number
}

export const emptyProductForm: ProductFormData = {
  name: '',
  brand: '',
  manufacturerId: '',
  size: '',
  price: 0,
  inStock: true,
  categoryId: '',
  subcategory: '',
  weight: undefined,
}

/** Strip UI-only sentinels before sending a form to the API. */
export function toProductPayload(data: ProductFormData) {
  const manufacturerId =
    data.manufacturerId && data.manufacturerId !== '__custom__'
      ? data.manufacturerId
      : undefined

  return {
    ...data,
    manufacturerId,
    brand: data.brand?.trim() || undefined,
  }
}

/** Toasts and returns false when a required field is missing. */
export function isFormValid(data: ProductFormData) {
  const hasMill =
    (data.manufacturerId && data.manufacturerId !== '__custom__') ||
    data.brand?.trim()

  if (data.name && hasMill && data.categoryId && data.subcategory) return true

  addToast({
    title: 'Validation',
    description: 'Name, mill, category, and sub-line are required',
    color: 'warning',
  })

  return false
}
