import Link from 'next/link'

import { PRODUCT_ROUTES } from '@/types/products'
import { siteConfig } from '@/config/site'
import { Logo } from '@/components/icons'

const companyLinks = [
  { href: '/products', label: 'Catalog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/weight/rebar', label: 'Weight calculators' },
]

const footerCategories = PRODUCT_ROUTES.slice(0, 8)

/**
 * Site footer — market-board chrome, theme tokens, real product voice.
 * Portfolio note kept quiet in the legal strip only.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className='w-full border-t border-border bg-muted/40'>
      <div className='mx-auto max-w-7xl px-4 pt-12 pb-0 md:px-6 md:pt-14'>
        <div className='grid gap-10 lg:grid-cols-12 lg:gap-12'>
          {/* Brand */}
          <div className='lg:col-span-4'>
            <Link
              className='inline-flex items-center gap-2.5 text-foreground transition-opacity duration-200 ease-out hover:opacity-80'
              href='/'
            >
              <Logo className='w-10 h-10 md:w-11 md:h-11' />
              <span className='text-base font-semibold tracking-tight'>
                {siteConfig.name}
              </span>
            </Link>
            <p className='mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground'>
              {siteConfig.tagline} Unit rates across rebar, sheet, structural
              sections, pipe, and billets — for industrial procurement.
            </p>
            <dl className='mt-6 grid grid-cols-2 gap-3 text-sm sm:max-w-xs'>
              <div className='border border-border bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Currency
                </dt>
                <dd className='font-mono text-sm font-medium tabular-nums text-foreground'>
                  USD
                </dd>
              </div>
              <div className='border border-border bg-card px-3 py-2.5'>
                <dt className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Basis
                </dt>
                <dd className='text-sm font-medium text-foreground'>
                  Ex-works
                </dd>
              </div>
            </dl>
          </div>

          {/* Link columns as board panels */}
          <div className='grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:col-span-8'>
            <nav aria-label='Company' className='bg-card px-5 py-5'>
              <h2 className='mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Company
              </h2>
              <ul className='space-y-2.5'>
                {companyLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      className='text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground'
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-label='Product families'
              className='bg-card px-5 py-5 sm:col-span-2'
            >
              <div className='mb-4 flex items-baseline justify-between gap-2'>
                <h2 className='font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Product index
                </h2>
                <Link
                  className='text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline'
                  href='/products'
                >
                  Full catalog
                </Link>
              </div>
              <ul className='grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3'>
                {footerCategories.map(cat => (
                  <li key={cat.href}>
                    <Link
                      className='text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground'
                      href={cat.href}
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Legal strip */}
        <div className='mt-12 flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p className='font-mono tabular-nums'>
            © {year} {siteConfig.name}
          </p>
          <p className='max-w-md sm:text-right'>
            Portfolio showcase by{' '}
            <Link
              className='font-medium text-foreground underline-offset-4 transition-colors duration-200 ease-out hover:underline'
              href={siteConfig.links.portfolio}
            >
              Sepehr Gorgini
            </Link>
            . Not the live client deployment.
          </p>
        </div>
      </div>
    </footer>
  )
}
