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
 * Extra filters (selects, hidden inputs) go in `children` and submit with it.
 */
export function SearchToolbar({
  path,
  query,
  placeholder,
  children,
}: {
  /** Route the form navigates to, e.g. `/admin/categories`. */
  path: string
  query?: string
  placeholder: string
  children?: ReactNode
}) {
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
        {children}
        <div className='flex flex-wrap gap-2'>
          <Button type='submit' variant='outline'>
            <Search aria-hidden className='h-4 w-4' />
            Search
          </Button>
          {query ? (
            <Button asChild variant='outline'>
              <Link href={path}>Clear</Link>
            </Button>
          ) : null}
        </div>
      </Form>
    </DataCard>
  )
}
