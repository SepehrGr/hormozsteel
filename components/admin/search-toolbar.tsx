import type { ReactNode } from 'react'

import Form from 'next/form'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { DataCard } from '@/components/admin/data-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'

/**
 * Search box that lives in the URL (`?q=`), so results are shareable, survive
 * reloads, and a server page can read them from `searchParams`.
 *
 * `next/form` turns the native GET submit into a client-side navigation.
 * Extra filters (selects) go in `children` and submit with it.
 */
export function SearchToolbar({
  path,
  query,
  placeholder,
  filtered = false,
  params = {},
  children,
}: {
  /** Route the form navigates to, e.g. `/admin/categories`. */
  path: string
  query?: string
  placeholder: string
  /** A filter in `children` is set, so offer Clear even with no search text. */
  filtered?: boolean
  /** Search params to keep across Search and Clear, e.g. `{ tab: 'contact' }`. */
  params?: Record<string, string>
  children?: ReactNode
}) {
  // A GET form drops any query string in its action, so params travel as hidden inputs.
  const kept = new URLSearchParams(params).toString()

  return (
    <DataCard title='Filters'>
      <Form
        action={path}
        className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center'
      >
        <div className='relative min-w-0 flex-1 sm:max-w-md'>
          <Search
            aria-hidden
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
          />
          {/* key resets the uncontrolled input when the URL changes */}
          <Input
            key={query}
            aria-label='Search'
            className='pl-9'
            defaultValue={query}
            name='q'
            placeholder={placeholder}
            type='search'
          />
        </div>
        {Object.entries(params).map(([name, value]) => (
          <input key={name} name={name} type='hidden' value={value} />
        ))}
        {children}
        <div className='flex flex-wrap gap-2 max-sm:*:flex-1'>
          <Button type='submit' variant='outline'>
            <Search aria-hidden className='h-4 w-4' />
            Search
          </Button>
          {query || filtered ? (
            <Button asChild variant='outline'>
              <Link href={kept ? `${path}?${kept}` : path}>Clear</Link>
            </Button>
          ) : null}
        </div>
      </Form>
    </DataCard>
  )
}
