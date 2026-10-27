'use client'

import type { PriceIndexRow } from '@/lib/data/catalog'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { formatUsd } from '@/lib/format'
import { productCategoryHref, productSubcategoryHref } from '@/types/products'

const POPULAR = ['Rebar 18', 'IPE 300', 'Hot-rolled sheet', 'Seamless pipe']

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/ø/g, '')
    .replace(/(\d)mm\b/g, '$1')
    .trim()

const lineHref = (row: PriceIndexRow) =>
  row.subcategory
    ? productSubcategoryHref(row.categorySlug, row.subcategory)
    : productCategoryHref(row.categorySlug)

/** Matches every typed word against name, mill and family, so "rebar 18" finds "Ribbed rebar 18mm". */
function match(index: PriceIndexRow[], query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean)

  if (words.length === 0) return []

  return index
    .filter(row => {
      const haystack = normalize(
        `${row.name} ${row.mill ?? ''} ${row.categorySlug} ${row.subcategory ?? ''}`,
      )

      return words.every(word => haystack.includes(word))
    })
    .slice(0, 6)
}

export default function PriceSearch({ index }: { index: PriceIndexRow[] }) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const hits = match(index, query)
  const showList = open && query.trim() !== ''

  return (
    <div
      className='relative mx-auto mt-8 max-w-[540px] text-left lg:mx-0'
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <form
        className='flex items-center gap-3 border border-border bg-card py-1.5 pl-4 pr-1.5 transition-colors duration-200 ease-out focus-within:border-amber-700 dark:focus-within:border-amber-500'
        role='search'
        onSubmit={e => {
          e.preventDefault()
          if (hits[0]) router.push(lineHref(hits[0]))
        }}
      >
        <Search
          aria-hidden
          className='h-5 w-5 shrink-0 text-muted-foreground'
        />
        <input
          aria-autocomplete='list'
          aria-controls={listId}
          aria-expanded={showList}
          aria-label='Find a price'
          autoComplete='off'
          className='min-w-0 flex-1 bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground'
          placeholder='Try "rebar 18", "IPE 300" or "pipe"'
          role='combobox'
          type='search'
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        />
        <button
          className='shrink-0 cursor-pointer bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
          type='submit'
        >
          Search
        </button>
      </form>

      {showList && (
        <ul
          className='absolute inset-x-0 top-full z-20 mt-2 border border-border bg-card p-1.5 shadow-lg'
          id={listId}
          role='listbox'
        >
          {hits.length === 0 ? (
            <li className='px-3 py-3 text-sm text-muted-foreground'>
              Nothing matches &ldquo;{query}&rdquo;. Try a family, like
              &ldquo;pipe&rdquo; or &ldquo;sheet&rdquo;.
            </li>
          ) : (
            hits.map(row => (
              <li key={row.id} aria-selected={false} role='option'>
                <Link
                  className='flex items-center justify-between gap-4 px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
                  href={lineHref(row)}
                >
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium text-foreground'>
                      {row.name}
                    </span>
                    {row.mill && (
                      <span className='block truncate text-xs text-muted-foreground'>
                        {row.mill}
                      </span>
                    )}
                  </span>
                  <span className='shrink-0 text-sm font-semibold tabular-nums text-foreground'>
                    {formatUsd(row.price)}
                    <span className='ml-1 text-xs font-normal text-muted-foreground'>
                      /{row.unit.toLowerCase()}
                    </span>
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}

      <div className='mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start'>
        Popular:
        {POPULAR.map(term => (
          <button
            key={term}
            className='cursor-pointer border border-border px-2.5 py-1 text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            type='button'
            onClick={() => {
              setQuery(term)
              setOpen(true)
            }}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
