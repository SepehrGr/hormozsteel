'use client'

import type { CategoryFormValues } from '@/lib/schemas/category'

import { useState } from 'react'

import { deleteCategory, updateCategory } from '@/app/admin/categories/actions'
import {
  type Column,
  AdminTable,
  expandColumn,
  NameCell,
  RowActions,
} from '@/components/admin/admin-table'
import { CategoryFormDialog } from '@/components/admin/categories/category-form-dialog'
import { ExpandableRow } from '@/components/admin/expandable-row'
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
  expandColumn,
  { label: 'Category' },
  { label: 'Slug' },
  { label: 'Sub-lines', className: 'text-center' },
  { label: 'Products', className: 'text-center' },
  { label: 'Actions', className: 'text-right' },
]

/** Categories table; the browser owns which row is being edited or deleted. */
export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState<CategoryRow | null>(null)

  return (
    <>
      <AdminTable columns={columns}>
        {categories.map(category => (
          <CategoryTableRow
            key={category.id}
            category={category}
            onDelete={() => setDeleting(category)}
            onEdit={() => setEditing(category)}
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
  onEdit,
  onDelete,
}: {
  category: CategoryRow
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <ExpandableRow
      colSpan={columns.length}
      detail={
        category.subcategories.length > 0 ? (
          <>
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
          </>
        ) : null
      }
      label={`Sub-lines of ${category.name}`}
    >
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
        <RowActions name={category.name} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </ExpandableRow>
  )
}
