import Link from 'next/link'
import { PRODUCT_CATEGORIES, productCategoryHref } from '@/types/products'
import { resolveCategoryIcon } from '@/config/category-icons'

type Props = {
  current?: string
}

export default function ProductsSidebar({ current }: Props) {
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
        {PRODUCT_CATEGORIES.map(cat => {
          const active = current === cat.slug || current === cat.id
          const iconClass = resolveCategoryIcon(cat.icon ?? cat.slug)
          return (
            <li key={cat.slug}>
              <Link
                href={productCategoryHref(cat.slug)}
                scroll={false}
                className={`group flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 ease-out ${
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <i
                  className={`${iconClass} text-base ${
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
                  <span className='mt-0.5 block font-mono text-[10px] tracking-wider text-muted-foreground'>
                    {cat.id.toUpperCase()}
                  </span>
                </span>
                {active ? (
                  <span
                    className='h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700 dark:bg-amber-500'
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
