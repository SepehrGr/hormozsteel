import type { ReactNode } from 'react'

import Link from 'next/link'

export default function SectionHead({
  title,
  link,
  children,
}: {
  title: string
  link?: { href: string; label: string }
  /** The lead paragraph under the heading. */
  children: ReactNode
}) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div className='max-w-2xl'>
        <h2 className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
          {title}
        </h2>
        <p className='mt-3 text-muted-foreground'>{children}</p>
      </div>
      {link && (
        <Link
          className='shrink-0 text-sm font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-500'
          href={link.href}
        >
          {link.label}
        </Link>
      )}
    </div>
  )
}
