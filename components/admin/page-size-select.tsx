'use client'

import { useRouter } from 'next/navigation'

import { Select } from '@/components/ui/field'

/** Rows-per-page picker; `hrefs` maps each size to the URL that shows it. */
export function PageSizeSelect({
  limit,
  hrefs,
}: {
  limit: number
  hrefs: Record<number, string>
}) {
  const router = useRouter()

  return (
    <label className='flex items-center gap-2 text-sm text-muted-foreground'>
      Per page
      <Select
        className='w-auto pointer-coarse:h-11'
        value={limit}
        onChange={e => router.push(hrefs[Number(e.target.value)])}
      >
        {Object.keys(hrefs).map(size => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Select>
    </label>
  )
}
