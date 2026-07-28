import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  isLoading: boolean
  itemsPerPage: number
  page: number
  pagination: { total: number; totalPages: number } | null
  onItemsPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
}

const pageBtn =
  'inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-foreground transition-colors duration-200 ease-out hover:bg-muted disabled:opacity-50'

/** Window of at most 5 page numbers, kept centered on the current page. */
function pageWindow(page: number, totalPages: number) {
  const size = Math.min(5, totalPages)
  const start =
    totalPages <= 5 || page <= 3
      ? 1
      : Math.min(page - 2, Math.max(1, totalPages - 4))

  return Array.from({ length: size }, (_, i) => start + i)
}

export default function Pagination({
  isLoading,
  itemsPerPage,
  page,
  pagination,
  onItemsPerPageChange,
  onPageChange,
}: Props) {
  const total = pagination?.total || 0

  return (
    <div className='flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <span>Show</span>
        <select
          aria-label='Rows per page'
          className='border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
          value={itemsPerPage}
          onChange={e => onItemsPerPageChange(parseInt(e.target.value, 10))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>

      <div className='text-sm text-muted-foreground'>
        Showing{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {pagination ? (page - 1) * itemsPerPage + 1 : 0}
        </span>{' '}
        –{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {pagination ? Math.min(page * itemsPerPage, total) : 0}
        </span>{' '}
        of{' '}
        <span className='font-medium tabular-nums text-foreground'>
          {total}
        </span>
      </div>

      <div className='flex items-center gap-1'>
        <button
          aria-label='Previous page'
          className={pageBtn}
          disabled={page === 1 || isLoading}
          type='button'
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        {pagination &&
          pageWindow(page, pagination.totalPages).map(pageNum => (
            <button
              key={pageNum}
              className={`inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm font-medium transition-colors duration-200 ease-out disabled:opacity-50 ${
                page === pageNum
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
              disabled={isLoading}
              type='button'
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        <button
          aria-label='Next page'
          className={pageBtn}
          disabled={!pagination || page === pagination.totalPages || isLoading}
          type='button'
          onClick={() =>
            onPageChange(
              pagination ? Math.min(pagination.totalPages, page + 1) : page,
            )
          }
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}
