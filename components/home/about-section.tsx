'use client'

import Link from 'next/link'
import { ShoppingCart, Headphones, ChartNoAxesCombined } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className='py-6'>
      <div className='container mx-auto px-4'>
        <div className='relative mb-10 overflow-hidden rounded-2xl border border-border bg-card px-8 py-14 text-center shadow-sm md:px-16 md:py-16'>
          <div className='relative z-10'>
            <h3 className='mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl'>
              Ready to browse the catalog?
            </h3>
            <p className='mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg'>
              Explore live product categories and pricing tables, or open the
              admin area to manage inventory (demo credentials after seed).
            </p>
            <div className='flex flex-col justify-center gap-3 sm:flex-row'>
              <Link
                href='/products'
                className='inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90'
              >
                View products
              </Link>
              <Link
                href='/contact'
                className='inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted'
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3'>
          {[
            {
              icon: ShoppingCart,
              title: 'Catalog & pricing',
              body: 'Category browse, filters, and price tables for steel products.',
            },
            {
              icon: ChartNoAxesCombined,
              title: 'Admin workflows',
              body: 'Manage products, categories, and manufacturers from one panel.',
            },
            {
              icon: Headphones,
              title: 'Quote-ready UX',
              body: 'Designed so buyers can scan specs and move to an order request.',
            },
          ].map(item => (
            <div
              key={item.title}
              className='rounded-xl border border-border bg-card p-5 text-left'
            >
              <item.icon className='mb-3 h-5 w-5 text-muted-foreground' />
              <h4 className='mb-1 text-sm font-semibold text-foreground'>
                {item.title}
              </h4>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
