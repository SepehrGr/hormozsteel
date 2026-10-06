import { PRODUCT_NAV } from '@/types/products'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Hormoz Steel',
  description:
    'Steel and metal unit pricing — rebar, beams, sheets, profiles, pipe, and billets. Catalog rates in USD for industrial procurement.',
  tagline: 'Mill products. Clear unit prices. Ready to quote.',
  /** Drives every number, price, and date formatter in lib/format.ts. */
  locale: 'en-US',
  currency: 'USD',
  navItems: [
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  navMenuItems: [
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  /** Hero + mega-menu product groups — slugs match PRODUCT_CATEGORIES. */
  heroItems: PRODUCT_NAV.map(group => ({
    name: group.name,
    icon: group.icon,
    label: group.label,
    href: group.href,
    items: group.items,
  })),
  links: {
    github: 'https://github.com/SepehrGR7',
    portfolio: 'https://sepehrgr.dev',
  },
}
