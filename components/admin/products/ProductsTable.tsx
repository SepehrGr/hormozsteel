// No React import needed with the new JSX transform
import React from 'react'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  inStock: boolean
  category: { name: string }
  subcategory: string
}

interface Props {
  products: Product[]
  isLoading: boolean
  selectedProducts: string[]
  onSelectAll: (checked: boolean) => void
  onSelectProduct: (id: string, checked: boolean) => void
  editingPriceId: string | null
  tempPrice: string
  setTempPrice: (v: string) => void
  onPriceClick: (p: Product) => void
  onPriceBlur: (p: Product) => void
  onPriceKeyDown: (e: React.KeyboardEvent, p: Product) => void
  onToggleStock: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  sortDescriptor: any
  onSortChange: (s: any) => void
}

// Simple wrapper that renders children. The full Table markup is still kept in the page
// to ensure handlers and types remain in a single place. This component can be
// extended later if needed.
export default function ProductsTable({
  children,
}: {
  children?: React.ReactNode
}) {
  return <div>{children}</div>
}
