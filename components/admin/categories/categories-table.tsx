'use client'

import type { CategoryFormValues } from '@/lib/schemas/category'

import { useState } from 'react'

import {
  deleteCategory,
  updateCategory,
} from '@/app/admin/(panel)/categories/actions'
import {
  type Column,
  actionsColumn,
  AdminTable,
  NameCell,
  RowActions,
} from '@/components/admin/admin-table'
import { CategoryFormDialog } from '@/components/admin/categories/category-form-dialog'
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

/** Categories table; the browser owns which row is being edited or deleted. */
export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState<CategoryRow | null>(null)

  const columns: Column<CategoryRow>[] = [
    {
      label: 'Category',
      narrow: 'title',
      cell: category => (
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
      ),
    },
    {
      label: 'Slug',
      cellClassName: 'font-mono text-xs text-muted-foreground',
      cell: category => category.slug,
    },
    {
      label: 'Sub-lines',
      className: 'text-center',
      cellClassName: 'tabular-nums text-muted-foreground',
      cell: category => category.subcategories.length,
    },
    {
      label: 'Products',
      className: 'text-center',
      cellClassName: 'tabular-nums text-foreground',
      cell: category => category._count.products,
    },
    actionsColumn(category => (
      <RowActions
        name={category.name}
        onDelete={() => setDeleting(category)}
        onEdit={() => setEditing(category)}
      />
    )),
  ]

  return (
    <>
      <AdminTable
        columns={columns}
        detail={category =>
          category.subcategories.length > 0 ? (
            <SubLines subcategories={category.subcategories} />
          ) : null
        }
        rowLabel={category => `Details of ${category.name}`}
        rows={categories}
      />

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

function SubLines({ subcategories }: { subcategories: string[] }) {
  return (
    <>
      <p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
        Sub-lines
      </p>
      <ul className='flex flex-wrap gap-2'>
        {subcategories.map(sub => (
          <li
            key={sub}
            className='border border-border bg-card px-2.5 py-1 text-xs text-foreground'
          >
            {sub}
          </li>
        ))}
      </ul>
    </>
  )
}
