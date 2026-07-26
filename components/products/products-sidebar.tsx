'use client'

import Link from 'next/link'
import { productCategoryHref } from '@/types/products'
import { useCategories } from '@/hooks/use-api'
import { resolveCategoryIcon } from '@/config/category-icons'

type Props = {
  currentSlug?: string
}

export default function ProductsSidebar({ currentSlug }: Props) {
  const { categories } = useCategories()

  return (
    <aside className='sticky top-24 border border-border bg-card'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
          Categories
        </h2>
        <Link
          href='/products'
          className='text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
        >
          Index
        </Link>
      </div>

      <ul className='divide-y divide-border'>
        {categories.map(cat => {
          const active = currentSlug === cat.slug
          const iconClass = resolveCategoryIcon(cat.icon ?? cat.slug)
          return (
            <li key={cat.slug}>
              <Link
                href={productCategoryHref(cat.slug)}
                scroll={false}
                className={`group flex items-center gap-3 px-4 py-6 text-sm transition-colors duration-200 ease-out ${
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <i
                  className={`${iconClass} text-3xl ${
                    active
                      ? 'text-amber-800 dark:text-amber-500'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                  aria-hidden
                />
                <span className='min-w-0 flex-1'>
                  <span className='block font-medium text-foreground'>
                    {cat.name}
                  </span>
                </span>
                {active ? (
                  <span
                    className='h-2 w-2 shrink-0 rounded-full bg-amber-700 dark:bg-amber-500'
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
