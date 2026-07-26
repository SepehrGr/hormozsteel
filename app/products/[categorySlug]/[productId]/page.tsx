import { cache } from 'react'
import { notFound } from 'next/navigation'
import UnifiedProductPage from '@/components/products/unified-product-page'
import { prisma } from '@/lib/prisma'
import { subcategorySlug } from '@/types/products'

interface PageProps {
  params: Promise<{
    categorySlug: string
    productId: string
  }>
}

export const dynamic = 'force-dynamic'

const getCategory = cache((slug: string) =>
  prisma.category.findUnique({ where: { slug } }),
)

function findSubcategory(subcategories: string[], productId: string) {
  return subcategories.find(
    sub => subcategorySlug(sub) === productId.toLowerCase(),
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { categorySlug, productId } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return { title: 'Product not found · Hormoz Steel' }
  }

  const subcategory = findSubcategory(category.subcategories, productId)
  const title = subcategory ? `${subcategory} ${category.name}` : category.name

  return {
    title: `${title} prices · Hormoz Steel`,
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

  return (
    <UnifiedProductPage
      categorySlug={category.slug}
      subcategory={subcategory}
      title={title}
      description={`${category.description ?? category.name}. Filtered to the ${subcategory} line. Unit prices in USD.`}
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
    />
  )
}
