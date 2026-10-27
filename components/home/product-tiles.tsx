import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import SectionHead from './section-head'

import { formatUsd } from '@/lib/format'
import { PRODUCT_NAV } from '@/types/products'

export default function ProductTiles({
  floors,
}: {
  floors: Record<string, { price: number; unit: string }>
}) {
  return (
    <section className='border-b border-border bg-muted/30'>
      <div className='mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24'>
        <SectionHead title='Shop by product'>
          Ten families, each with its own board of sizes, grades and mills.
        </SectionHead>

        <ul className='mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5'>
          {PRODUCT_NAV.map(group => {
            const floor = floors[group.name]

            return (
              <li key={group.name}>
                <Link
                  className='group flex h-full flex-col border border-border bg-card p-5 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-700 dark:hover:border-amber-500'
                  href={group.href}
                >
                  <i
                    aria-hidden
                    className={`${group.icon} text-4xl leading-none text-foreground/70 transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500`}
                  />
                  <span className='mt-5 font-semibold tracking-tight text-foreground'>
                    {group.label}
                  </span>
                  <span className='mt-1 text-sm leading-snug text-muted-foreground'>
                    {group.items.map(item => item.label).join(' · ')}
                  </span>
                  <span className='mt-auto flex items-center justify-between gap-2 pt-5 text-sm text-muted-foreground'>
                    {floor ? (
                      <span>
                        from{' '}
                        <span className='font-semibold tabular-nums text-foreground'>
                          {formatUsd(floor.price)}
                        </span>{' '}
                        /{floor.unit.toLowerCase()}
                      </span>
                    ) : (
                      <span>Open board</span>
                    )}
                    <ArrowRight
                      aria-hidden
                      className='h-4 w-4 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100'
                    />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
