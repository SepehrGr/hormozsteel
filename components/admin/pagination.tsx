import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PageSizeSelect } from '@/components/admin/page-size-select'
import { cn } from '@/lib/utils'

export const PAGE_SIZES = [10, 20, 50, 100]

/** `?page` and `?limit` from the URL, falling back to page 1 of the smallest size. */
export function pageParams(pageParam: unknown, limitParam: unknown) {
  const page = Math.max(1, Number.parseInt(String(pageParam), 10) || 1)
  const limit =
    PAGE_SIZES.find(size => String(size) === limitParam) ?? PAGE_SIZES[0]

  return { page, limit, skip: (page - 1) * limit }
}

/** Window of at most 5 page numbers, kept centered on the current page. */
function pageWindow(page: number, totalPages: number) {
  const size = Math.min(5, totalPages)
  const start =
    totalPages <= 5 || page <= 3
      ? 1
      : Math.min(page - 2, Math.max(1, totalPages - 4))

  return Array.from({ length: size }, (_, i) => start + i)
}

const cell =
  'inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm font-medium transition-colors duration-200 ease-out pointer-coarse:h-11 pointer-coarse:min-w-11'
const idle = 'border-border bg-card text-foreground hover:bg-muted'
const current = 'border-primary bg-primary text-primary-foreground'
const disabled = 'pointer-events-none border-border bg-card opacity-50'

/** Page links for a server page; `params` are the other search params to keep. */
export function Pagination({
  path,
  params,
  page,
  limit,
  total,
}: {
  path: string
  params: Record<string, string>
  page: number
  limit: number
  total: number
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const href = (to: { page?: number; limit?: number }) => {
    const search = new URLSearchParams(params)
    const nextLimit = to.limit ?? limit

    if (nextLimit !== PAGE_SIZES[0]) search.set('limit', String(nextLimit))
    if (to.page && to.page > 1) search.set('page', String(to.page))

    return search.size ? `${path}?${search}` : path
  }

  const step = (to: number, label: string, Icon: typeof ChevronLeft) =>
    to < 1 || to > totalPages ? (
      <span aria-disabled className={cn(cell, disabled)}>
        <Icon aria-label={label} className='h-4 w-4' />
      </span>
    ) : (
      <Link
        aria-label={label}
        className={cn(cell, idle)}
        href={href({ page: to })}
      >
        <Icon aria-hidden className='h-4 w-4' />
      </Link>
    )

  return (
    <div className='flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
      <PageSizeSelect
        hrefs={Object.fromEntries(
          PAGE_SIZES.map(size => [size, href({ limit: size })]),
        )}
        limit={limit}
      />

      <p className='text-sm text-muted-foreground'>
        Showing{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {total ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)}
        </span>{' '}
        of{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {total}
        </span>
      </p>

      <nav
        aria-label='Pages'
        className='flex items-center gap-1 max-sm:justify-between'
      >
        {step(page - 1, 'Previous page', ChevronLeft)}
        {pageWindow(page, totalPages).map(n => (
          <Link
            key={n}
            aria-current={n === page ? 'page' : undefined}
            className={cn(cell, 'max-sm:hidden', n === page ? current : idle)}
            href={href({ page: n })}
          >
            {n}
          </Link>
        ))}
        <span className='text-sm text-muted-foreground sm:hidden'>
          Page{' '}
          <span className='font-medium tabular-nums text-foreground'>
            {page}
          </span>{' '}
          of{' '}
          <span className='font-medium tabular-nums text-foreground'>
            {totalPages}
          </span>
        </span>
        {step(page + 1, 'Next page', ChevronRight)}
      </nav>
    </div>
  )
}
