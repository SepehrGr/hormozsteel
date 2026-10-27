import type { LatestPrice } from '@/lib/data/prices'

import Link from 'next/link'

import PriceMove from './price-move'
import SectionHead from './section-head'

import { formatUsd } from '@/lib/format'
import { productCategoryHref, productSubcategoryHref } from '@/types/products'

const lineHref = ({ categorySlug, subcategory }: LatestPrice) =>
  !categorySlug
    ? '/products'
    : subcategory
      ? productSubcategoryHref(categorySlug, subcategory)
      : productCategoryHref(categorySlug)

export default function LatestPrices({
  products,
}: {
  products: LatestPrice[]
}) {
  return (
    <section className='border-b border-border bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24'>
        <SectionHead
          link={{ href: '/products', label: 'Open the full catalog' }}
          title='Latest price changes'
        >
          The lines that moved last, newest first. Demo prices, reset every
          hour.
        </SectionHead>

        {products.length === 0 ? (
          <p className='mt-10 border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground'>
            No recent price moves yet.
          </p>
        ) : (
          <table className='mt-10 w-full text-left'>
            <thead>
              <tr className='border-b border-border text-xs font-medium text-muted-foreground'>
                <th className='py-3 pr-4 font-medium'>Product</th>
                <th className='hidden py-3 pr-4 font-medium md:table-cell'>
                  Mill
                </th>
                <th className='hidden py-3 pr-4 font-medium sm:table-cell'>
                  Updated
                </th>
                <th className='py-3 pr-4 text-right font-medium'>Price</th>
                <th className='py-3 text-right font-medium'>Change</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr
                  key={product.id}
                  className='border-b border-border transition-colors duration-150 ease-out hover:bg-muted/50'
                >
                  <td className='py-4 pr-4'>
                    <Link
                      className='font-medium text-foreground underline-offset-4 hover:underline'
                      href={lineHref(product)}
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className='hidden py-4 pr-4 text-muted-foreground md:table-cell'>
                    {product.brand ?? '—'}
                  </td>
                  <td className='hidden py-4 pr-4 tabular-nums text-muted-foreground sm:table-cell'>
                    {product.updated}
                  </td>
                  <td className='py-4 pr-4 text-right'>
                    <span className='text-lg font-semibold tabular-nums text-foreground'>
                      {formatUsd(product.price)}
                    </span>
                    <span className='ml-1 text-sm text-muted-foreground'>
                      /{product.unit.toLowerCase()}
                    </span>
                  </td>
                  <td className='py-4 text-right'>
                    <PriceMove
                      delta={product.delta}
                      direction={product.direction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
