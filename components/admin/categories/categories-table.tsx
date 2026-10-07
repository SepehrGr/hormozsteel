'use client'

import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { resolveCategoryIcon } from '@/config/category-icons'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  subcategories: string[]
  _count: { products: number }
}

/** Categories table; the browser only owns which rows are expanded. */
export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)

      if (!next.delete(id)) next.add(id)

      return next
    })

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[640px] text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
            <th className='w-12 px-4 py-2.5'>
              <span className='sr-only'>Expand</span>
            </th>
            <th className='px-4 py-2.5'>Category</th>
            <th className='px-4 py-2.5'>Slug</th>
            <th className='px-4 py-2.5 text-center'>Sub-lines</th>
            <th className='px-4 py-2.5 text-center'>Products</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {categories.map(category => (
            <CategoryTableRow
              key={category.id}
              category={category}
              isExpanded={expanded.has(category.id)}
              onToggle={() => toggle(category.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CategoryTableRow({
  category,
  isExpanded,
  onToggle,
}: {
  category: CategoryRow
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasSubs = category.subcategories.length > 0

  return (
    <Fragment>
      <tr className='transition-colors duration-200 ease-out hover:bg-muted/40'>
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
          <div className='flex items-center gap-3'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted/50 text-foreground'>
              <i
                aria-hidden
                className={`${resolveCategoryIcon(category.icon || category.slug)} text-lg`}
              />
            </span>
            <div className='min-w-0'>
              <p className='font-medium text-foreground'>{category.name}</p>
              {category.description ? (
                <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>
                  {category.description}
                </p>
              ) : null}
            </div>
          </div>
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
      </tr>

      {isExpanded && hasSubs ? (
        <tr className='bg-muted/30'>
          <td className='px-4 py-3 pl-16' colSpan={5}>
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
