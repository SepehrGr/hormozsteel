import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import CategoryProducts from '@/components/products/category-products'
import ProductsSidebar from '@/components/products/products-sidebar'
import { resolveCategoryIcon } from '@/config/category-icons'
import { prisma } from '@/lib/prisma'
import { ChevronRight } from 'lucide-react'

interface PageProps {
  params: Promise<{
    categorySlug: string
  }>
}

/** Boards are prerendered per category and refreshed hourly; new slugs render on demand. */
export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } })

  return categories.map(category => ({ categorySlug: category.slug }))
}

const getCategory = cache((slug: string) =>
  prisma.category.findUnique({ where: { slug } }),
)

const getCategories = cache(() =>
  prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
)

export async function generateMetadata({ params }: PageProps) {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return { title: 'Category not found · Hormoz Steel' }
  }

  return {
    title: `${category.name} prices · Hormoz Steel`,
    description: `${category.description ?? category.name}. USD unit prices from the Hormoz Steel catalog.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params
  const [category, categories] = await Promise.all([
    getCategory(categorySlug),
    getCategories(),
  ])

  if (!category) {
    notFound()
  }

  const iconClass = resolveCategoryIcon(category.icon ?? category.slug)
  const code = category.slug.toUpperCase()

  return (
    <div className='w-full'>
      <header className='border-b border-border'>
        <div className='mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14'>
          <nav
            className='mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'
            aria-label='Breadcrumb'
          >
            <Link
              href='/products'
              className='transition-colors duration-200 ease-out hover:text-foreground'
            >
              Products
            </Link>
            <ChevronRight className='h-3 w-3' />
            <span className='text-foreground'>{category.name}</span>
          </nav>

          <div className='grid gap-8 lg:grid-cols-12 lg:items-end'>
            <div className='lg:col-span-7'>
              <div className='mb-3 flex items-center gap-3'>
                <span className='font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  Pricing board
                </span>
                <span className='font-mono text-[10px] font-medium tracking-[0.16em] text-amber-800 dark:text-amber-500'>
                  {code}
                </span>
              </div>
              <div className='flex items-start gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-card'>
                  <i
                    className={`${iconClass} text-2xl text-foreground`}
                    aria-hidden
                  />
                </div>
                <div>
                  <h1 className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                    {category.name}
                  </h1>
                  <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base'>
                    {category.description ?? category.name}. Filter by mill and
                    size, compare unit
                    rates in USD, and request a firm quote from sales.
                  </p>
                </div>
              </div>
            </div>

            <dl className='grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:col-span-5'>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Sub-lines
                </dt>
                <dd className='mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground'>
                  {category.subcategories.length}
                </dd>
              </div>
              <div className='bg-card px-4 py-3'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Currency
                </dt>
                <dd className='mt-0.5 text-sm font-medium text-foreground'>USD</dd>
              </div>
              <div className='bg-card px-4 py-3 sm:col-span-2'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Lines covered
                </dt>
                <dd className='mt-1 text-sm leading-relaxed text-foreground'>
                  {category.subcategories.join(' · ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className='border-b border-border bg-background'>
        <div className='mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-9'>
              <CategoryProducts category={category} />
            </div>
            <div className='lg:col-span-3'>
              <ProductsSidebar
                categories={categories}
                currentSlug={category.slug}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
