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
