import { PRODUCT_NAV } from '@/types/products'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Hormoz Steel',
  description:
    'Live steel and metal pricing catalog — rebar, beams, sheets, profiles, and more. Built as an English portfolio demo.',
  tagline: 'Clear prices. Fast quotes. Industrial products.',
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
      label: 'Home',
      href: '/',
    },
    {
      label: 'Products',
      href: '/products',
    },
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
