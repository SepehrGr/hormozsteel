'use client'

import type { CategoryFormValues } from '@/lib/schemas/category'

import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { deleteCategory, updateCategory } from '@/app/admin/categories/actions'
import {
  type Column,
  AdminTable,
  NameCell,
  RowActions,
  rowClass,
} from '@/components/admin/admin-table'
import { CategoryFormDialog } from '@/components/admin/categories/category-form-dialog'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { DialogScope } from '@/components/ui/dialog-scope'
import { CATEGORY_ICONS, resolveCategoryIcon } from '@/config/category-icons'
import { pluralize } from '@/lib/format'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  subcategories: string[]
  _count: { products: number }
}

/** A database row in the shape the category form holds. */
function toFormValues(category: CategoryRow): CategoryFormValues {
  // Legacy classes (e.g. icon-Wire-products) become their current option;
  // anything else not in the list falls back to "Default from slug".
  const icon = category.icon ? resolveCategoryIcon(category.icon) : ''

  return {
    name: category.name,
    slug: category.slug,
    icon: Object.values(CATEGORY_ICONS).find(cls => cls === icon) ?? '',
    description: category.description ?? '',
    subcategories: category.subcategories.map(value => ({ value })),
  }
}

const columns: Column[] = [
  { label: <span className='sr-only'>Expand</span>, className: 'w-12' },
  { label: 'Category' },
  { label: 'Slug' },
  { label: 'Sub-lines', className: 'text-center' },
  { label: 'Products', className: 'text-center' },
  { label: 'Actions', className: 'text-right' },
]

/** Categories table; the browser owns which rows are expanded, edited, or being deleted. */
export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState<CategoryRow | null>(null)

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)

      if (!next.delete(id)) next.add(id)

      return next
    })

  return (
    <>
      <AdminTable columns={columns}>
        {categories.map(category => (
          <CategoryTableRow
            key={category.id}
            category={category}
            isExpanded={expanded.has(category.id)}
            onDelete={() => setDeleting(category)}
            onEdit={() => setEditing(category)}
            onToggle={() => toggle(category.id)}
          />
        ))}
      </AdminTable>

      {editing ? (
        <DialogScope onClose={() => setEditing(null)}>
          <CategoryFormDialog
            action={values => updateCategory({ id: editing.id, values })}
            defaultValues={toFormValues(editing)}
            mode='edit'
          />
        </DialogScope>
      ) : null}
      {deleting ? (
        <DialogScope onClose={() => setDeleting(null)}>
          <DeleteDialog
            action={() => deleteCategory({ id: deleting.id })}
            // The action refuses too; this count is only as fresh as the page.
            blocked={deleting._count.products > 0}
            name={deleting.name}
            noun='category'
          >
            {deleting._count.products > 0 ? (
              <>
                <span className='font-medium'>{deleting.name}</span> still has{' '}
                {pluralize(deleting._count.products, 'product')}. Move or delete
                them first: deleting a category deletes every product in it.
              </>
            ) : null}
          </DeleteDialog>
        </DialogScope>
      ) : null}
    </>
  )
}

function CategoryTableRow({
  category,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: CategoryRow
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const hasSubs = category.subcategories.length > 0

  return (
    <Fragment>
      <tr className={rowClass}>
        <td className='px-2 py-3 text-center'>
          <Button
            aria-expanded={isExpanded}
            aria-label={`Sub-lines of ${category.name}`}
            className='text-muted-foreground disabled:opacity-30'
            disabled={!hasSubs}
            size='icon'
            variant='ghost'
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown aria-hidden className='h-4 w-4' />
            ) : (
              <ChevronRight aria-hidden className='h-4 w-4' />
            )}
          </Button>
        </td>
        <td className='px-4 py-3'>
          <NameCell
            description={category.description}
            media={
              <i
                aria-hidden
                className={`${resolveCategoryIcon(category.icon || category.slug)} text-lg text-foreground`}
              />
            }
            name={category.name}
          />
        </td>
        <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
          {category.slug}
        </td>
        <td className='px-4 py-3 text-center tabular-nums text-muted-foreground'>
          {category.subcategories.length}
        </td>
        <td className='px-4 py-3 text-center tabular-nums text-foreground'>
          {category._count.products}
        </td>
        <td className='px-4 py-3'>
          <RowActions
            name={category.name}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </td>
      </tr>

      {isExpanded && hasSubs ? (
        <tr className='bg-muted/30'>
          <td className='px-4 py-3 pl-16' colSpan={columns.length}>
            <p className='mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
              Sub-lines
            </p>
            <ul className='flex flex-wrap gap-2'>
              {category.subcategories.map(sub => (
                <li
                  key={sub}
                  className='border border-border bg-card px-2.5 py-1 text-xs text-foreground'
                >
                  {sub}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      ) : null}
    </Fragment>
  )
}
