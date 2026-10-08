import { Contact, Factory, Package } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { EmptyState } from '@/components/admin/empty-state'
import { createManufacturer } from '@/app/admin/manufacturers/actions'
import { ManufacturerFormDialog } from '@/components/admin/manufacturers/manufacturer-form-dialog'
import { DialogButton } from '@/components/ui/dialog-button'
import { ManufacturersTable } from '@/components/admin/manufacturers/manufacturers-table'
import { PageHeader } from '@/components/admin/page-header'
import { SearchToolbar } from '@/components/admin/search-toolbar'
import { StatsBoard } from '@/components/admin/stats-board'
import { prisma } from '@/lib/prisma'
import { matchesSearch, sum } from '@/lib/utils'

export default async function ManufacturersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  const manufacturers = await prisma.manufacturer.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      website: true,
      email: true,
      phone: true,
      address: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  // Filtered here rather than in SQL so the stats still count everything.
  // ponytail: fine for a few dozen mills; move into `where` if that grows.
  const visible = manufacturers.filter(m =>
    matchesSearch(query, [m.name, m.slug, m.email]),
  )

  const addButton = (
    <DialogButton label='Add manufacturer'>
      <ManufacturerFormDialog action={createManufacturer} mode='create' />
    </DialogButton>
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        actions={addButton}
        description='Mills and suppliers linked to catalog products.'
        eyebrow='Catalog'
        icon={Factory}
        title='Manufacturers'
      />

      <StatsBoard
        stats={[
          { label: 'Mills', value: manufacturers.length, icon: Factory },
          {
            label: 'With contact',
            value: manufacturers.filter(m => m.website || m.email || m.phone)
              .length,
            icon: Contact,
          },
          {
            label: 'Products linked',
            value: sum(manufacturers, m => m._count.products),
            icon: Package,
          },
        ]}
      />

      <SearchToolbar
        path='/admin/manufacturers'
        placeholder='Search name, slug, or email…'
        query={query}
      />

      <DataCard icon={Factory} title={`Mills (${visible.length})`}>
        {visible.length > 0 ? (
          <ManufacturersTable manufacturers={visible} />
        ) : (
          <EmptyState
            action={query ? undefined : addButton}
            description={
              query ? 'Try a different search.' : 'Add a mill to link products.'
            }
            icon={Factory}
            title={
              query
                ? `No manufacturers match “${query}”`
                : 'No manufacturers yet'
            }
          />
        )}
      </DataCard>
    </div>
  )
}
