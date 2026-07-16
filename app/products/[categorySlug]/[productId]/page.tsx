import { notFound } from 'next/navigation'
import UnifiedProductPage from '@/components/products/unified-product-page'
import { PRODUCT_CATEGORIES, subcategorySlug } from '@/types/products'

interface ProductPageProps {
  params: Promise<{
    categorySlug: string
    productId: string
  }>
}

function findCategory(categorySlug: string) {
  return PRODUCT_CATEGORIES.find(
    c => c.slug === categorySlug || c.id === categorySlug,
  )
}

function findSubcategory(
  category: (typeof PRODUCT_CATEGORIES)[number],
  productId: string,
) {
  return category.subcategories.find(
    sub => subcategorySlug(sub) === productId.toLowerCase(),
  )
}

/**
 * Pre-render category × subcategory pairs.
 * Route shape: /products/{categorySlug}/{subcategory-slug}
 */
export async function generateStaticParams() {
  return PRODUCT_CATEGORIES.flatMap(category =>
    category.subcategories.map(sub => ({
      categorySlug: category.slug,
      productId: subcategorySlug(sub),
    })),
  )
}

export const dynamicParams = true

export async function generateMetadata({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params
  const category = findCategory(categorySlug)
  if (!category) {
    return { title: 'Product not found · Hormoz Steel' }
  }

  const subcategory = findSubcategory(category, productId)
  const title = subcategory
    ? `${subcategory} ${category.name}`
    : category.name

  return {
    title: `${title} prices · Hormoz Steel`,
    description: `USD unit prices for ${title}. ${category.description}`,
  }
}

export default async function DynamicProductPage({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params

  const category = findCategory(categorySlug)
  if (!category) notFound()

  const subcategory = findSubcategory(category, productId)
  if (!subcategory) notFound()

  const title = `${subcategory} ${category.name}`

  return (
    <UnifiedProductPage
      category={category.slug}
      subcategory={subcategory}
      title={title}
      description={`${category.description} Filtered to the ${subcategory} line. Unit prices in USD.`}
      features={[
        'Unit prices from the demo catalog seed (not live market feeds)',
        'Filter by mill brand, size, stock, and price range',
        'Row actions for quote requests and weight estimation',
      ]}
      applications={[
        'Procurement and bid estimates',
        'Job-site material takeoff',
        'Mill / merchant stock comparison',
      ]}
      specifications={{
        Category: category.name,
        Subcategory: subcategory,
        Currency: 'USD',
        'Quote basis': 'Ex-works style demo rates',
        Units: 'Per product (kg / ton / meter / piece)',
      }}
      productId={productId}
    />
  )
}
