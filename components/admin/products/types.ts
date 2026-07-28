/** Fields the bulk-edit modal can push onto every selected product. */
export interface BulkUpdateData {
  price?: number
  inStock?: boolean
  categoryId?: string
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
