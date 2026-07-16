import { notFound } from 'next/navigation'
import UnifiedProductPage from '@/components/products/unified-product-page'
import { PRODUCT_CATEGORIES } from '@/types/products'

interface ProductPageProps {
  params: Promise<{
    categorySlug: string
    productId: string
  }>
}

/** URL-safe slug for a subcategory label (e.g. "Hot-rolled" → "hot-rolled"). */
function subcategorySlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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
 * Pre-render category × subcategory pairs for the catalog.
 * `productId` is the subcategory slug (e.g. /products/rebar/ribbed).
 */
export async function generateStaticParams() {
  return PRODUCT_CATEGORIES.flatMap(category =>
    category.subcategories.map(sub => ({
      categorySlug: category.slug,
      productId: subcategorySlug(sub),
    })),
  )
}

/** Allow DB product slugs or new subcategories at runtime without rebuild. */
export const dynamicParams = true

export async function generateMetadata({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params
  const category = findCategory(categorySlug)
  if (!category) {
    return { title: 'Product not found' }
  }

  const subcategory = findSubcategory(category, productId)
  const title = subcategory
    ? `${subcategory} ${category.name}`
    : category.name

  return {
    title: `${title} | Hormoz Steel`,
    description:
      category.description ||
      `Live catalog pricing for ${title}. Unit prices in USD.`,
  }
}

export default async function DynamicProductPage({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params

  const category = findCategory(categorySlug)
  if (!category) {
    notFound()
  }

  const subcategory = findSubcategory(category, productId)
  if (!subcategory) {
    notFound()
  }

  const title = `${subcategory} ${category.name}`

  return (
    <UnifiedProductPage
      category={category.slug}
      subcategory={subcategory}
      title={title}
      description={`${category.description} — ${subcategory} line items with unit pricing in USD.`}
      features={[
        'Catalog unit prices updated from the demo seed',
        'Filter by size, brand, and stock on the pricing table',
        'Weight calculators available for common mill products',
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
        Units: 'KG / TON / METER / PIECE (per product)',
      }}
      productId={productId}
    />
  )
}
