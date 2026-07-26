'use client'

import ProductPage from '@/components/products/product-page'

interface UnifiedProductPageProps {
  categorySlug: string
  subcategory: string
  title: string
  description?: string
  features?: string[]
  applications?: string[]
  specifications?: { [key: string]: string }
}

/** Thin wrapper so route pages can stay server components. */
export default function UnifiedProductPage(props: UnifiedProductPageProps) {
  return <ProductPage {...props} />
}
