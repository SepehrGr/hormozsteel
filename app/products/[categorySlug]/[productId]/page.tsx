import { notFound } from 'next/navigation'

import ProductNotes from '@/components/products/product-notes'
import ProductPage from '@/components/products/product-page'
import {
  getCategories,
  getCategory,
  getCategoryProducts,
} from '@/lib/data/catalog'
import { subcategorySlug } from '@/types/products'

interface PageProps {
  params: Promise<{
    categorySlug: string
    productId: string
  }>
}

/** Sub-line pages are prerendered per category × subcategory, refreshed hourly. */
export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getCategories()

  return categories.flatMap(category =>
    category.subcategories.map(sub => ({
      categorySlug: category.slug,
      productId: subcategorySlug(sub),
    })),
  )
}

function findSubcategory(subcategories: string[], productId: string) {
  return subcategories.find(
    sub => subcategorySlug(sub) === productId.toLowerCase(),
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { categorySlug, productId } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return { title: 'Product not found' }
  }

  const subcategory = findSubcategory(category.subcategories, productId)
  const title = subcategory ? `${subcategory} ${category.name}` : category.name

  return {
    title: `${title} prices`,
    description: `USD unit prices for ${title}. ${category.description ?? category.name}.`,
  }
}

export default async function DynamicProductPage({ params }: PageProps) {
  const { categorySlug, productId } = await params

  const category = await getCategory(categorySlug)

  if (!category) notFound()

  const subcategory = findSubcategory(category.subcategories, productId)

  if (!subcategory) notFound()

  const title = `${subcategory} ${category.name}`
  const products = await getCategoryProducts(category.slug, subcategory)

  return (
    <ProductPage
      category={category}
      description={`${category.description ?? category.name}. Filtered to the ${subcategory} line. Unit prices in USD.`}
      products={products}
      subcategory={subcategory}
      title={title}
    >
      <ProductNotes
        applications={[
          'Procurement and bid estimates',
          'Job-site material takeoff',
          'Mill / merchant stock comparison',
        ]}
        features={[
          'Unit prices from the demo catalog seed (not live market feeds)',
          'Filter by mill brand, size, stock, and price range',
          'Row actions for quote requests and weight estimation',
        ]}
        specifications={{
          Category: category.name,
          Subcategory: subcategory,
          Currency: 'USD',
          'Quote basis': 'Ex-works style demo rates',
          Units: 'Per product (kg / ton / meter / piece)',
        }}
      />
    </ProductPage>
  )
}
