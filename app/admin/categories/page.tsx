import { FolderTree, Layers, Package } from 'lucide-react'

import { AddCategoryButton } from '@/components/admin/categories/add-category-button'
import { CategoriesTable } from '@/components/admin/categories/categories-table'
import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { PageHeader } from '@/components/admin/page-header'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { prisma } from '@/lib/prisma'
import { matchesSearch, sum } from '@/lib/utils'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      description: true,
      subcategories: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  // Filtered here rather than in SQL so the stats above still count everything.
  // ponytail: fine for a few dozen categories; move into `where` if that grows.
  const visible = categories.filter(c =>
    matchesSearch(query, [c.name, c.slug, ...c.subcategories]),
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={<AddCategoryButton />}
        description='Product families, slugs, icons, and sub-lines.'
        eyebrow='Catalog'
        icon={FolderTree}
        title='Categories'
      />

      <StatsBoard
        stats={[
          { label: 'Categories', value: categories.length, icon: FolderTree },
          {
            label: 'Sub-lines',
            value: sum(categories, c => c.subcategories.length),
            icon: Layers,
          },
          {
            label: 'Products linked',
            value: sum(categories, c => c._count.products),
            icon: Package,
          },
        ]}
      />

      <SearchToolbar
        path='/admin/categories'
        placeholder='Search name, slug, or sub-line…'
        query={query}
      />

      <DataCard icon={FolderTree} title={`Families (${visible.length})`}>
        {visible.length > 0 ? (
          <CategoriesTable categories={visible} />
        ) : (
          <EmptyState
            action={query ? undefined : <AddCategoryButton />}
            description={
              query
                ? 'Try a different search.'
                : 'Add the first product family to start the catalog.'
            }
            icon={FolderTree}
            title={
              query ? `No categories match “${query}”` : 'No categories yet'
            }
          />
        )}
      </DataCard>
    </div>
  )
}
