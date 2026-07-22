import type { PriceDirection, ProductUnit } from '@prisma/client'

/** Public product DTO used by UI components. */
export interface ProductDTO {
  id: string
  name: string
  slug: string
  description?: string | null
  size: string
  unit: ProductUnit | string
  price: number
  previousPrice?: number | null
  priceDirection?: PriceDirection | string | null
  priceDelta?: number | null
  priceUpdatedAt?: string | Date | null
  weightKg?: number | null
  inStock: boolean
  images: string[]
  subcategory?: string | null
  specs?: Record<string, unknown> | null
  features?: string[]
  applications?: string[]
  categoryId: string
  manufacturerId?: string | null
  brand?: string | null
  category?: {
    id?: string
    name: string
    slug?: string
    icon?: string | null
  }
  /** Denormalized from API (e.g. latest-prices) for board links. */
  categorySlug?: string
  manufacturer?: {
    id: string
    name: string
    slug: string
  } | null
  priceHistory?: {
    changeType?: string | null
    changeAmount?: number | null
    changedAt?: string | null
  } | null
  lastUpdated?: string
  grade?: string
  categoryIcon?: string
}

export type Product = ProductDTO

export interface CategoryDTO {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  sortOrder?: number
  subcategories: string[]
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  brand?: string
  inStock?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
}

export interface PriceFilter {
  brand?: string
  subcategory?: string
  inStock?: boolean
  search?: string
  minPrice?: number
  maxPrice?: number
  thickness?: string | string[]
  sheetType?: string | string[]
  pipeType?: string | string[]
  [key: string]: unknown
}

/** Static category catalog for routes / filters (IDs = slugs, match seed). */
export const PRODUCT_CATEGORIES: Array<{
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  subcategories: string[]
}> = [
  {
    id: 'rebar',
    name: 'Rebar',
    slug: 'rebar',
    description: 'Ribbed and plain reinforcing bar',
    icon: 'icon-rebar', // icomoon
    subcategories: ['Ribbed', 'Plain', 'Coil', 'Stainless'],
  },
  {
    id: 'beam',
    name: 'Beams',
    slug: 'beam',
    description: 'I-beams, H-beams, and specialty sections',
    icon: 'icon-girder',
    subcategories: ['I-beam', 'H-beam', 'Castellated', 'Rail'],
  },
  {
    id: 'sheet',
    name: 'Sheets',
    slug: 'sheet',
    description: 'Hot-rolled, cold-rolled, and coated sheet',
    icon: 'icon-sheet',
    subcategories: [
      'Hot-rolled',
      'Cold-rolled',
      'Galvanized',
      'Color-coated',
      'Stainless',
    ],
  },
  {
    id: 'profile',
    name: 'Profiles',
    slug: 'profile',
    description: 'Structural and industrial profiles',
    icon: 'icon-profile',
    subcategories: ['Structural', 'Industrial', 'IPE', 'HEA', 'HEB', 'UPE'],
  },
  {
    id: 'angle',
    name: 'Angles & channels',
    slug: 'angle',
    description: 'Angle bars, channels, and T-sections',
    icon: 'icon-Corners',
    subcategories: ['Angle', 'Channel', 'T-bar', 'Galvanized'],
  },
  {
    id: 'pipe',
    name: 'Pipes',
    slug: 'pipe',
    description: 'Seamed, seamless, and specialty pipe',
    icon: 'icon-pipe',
    subcategories: ['Seamed', 'Seamless', 'Galvanized', 'Stainless'],
  },
  {
    id: 'wire',
    name: 'Wire',
    slug: 'wire',
    description: 'Black, galvanized, and barbed wire',
    icon: 'icon-wire',

    subcategories: ['Black', 'Galvanized', 'Barbed', 'Cable'],
  },
  {
    id: 'mesh',
    name: 'Mesh',
    slug: 'mesh',
    description: 'Fence and welded mesh',
    icon: 'icon-grating',
    subcategories: ['Fence', 'Welded', 'Galvanized'],
  },
  {
    id: 'shamsh',
    name: 'Billets',
    slug: 'shamsh',
    description: 'Steel and alloy billets',
    icon: 'icon-bullion',
    subcategories: ['Carbon', 'Alloy'],
  },
  {
    id: 'qooti',
    name: 'Tubes',
    slug: 'qooti',
    description: 'Square and rectangular hollow sections',
    icon: 'icon-profil',
    subcategories: ['Industrial', 'Column'],
  },
]

/** Static catalog category entry (matches PRODUCT_CATEGORIES items). */
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/** URL-safe slug for a subcategory label (e.g. "Hot-rolled" → "hot-rolled"). */
export function subcategorySlug(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function productCategoryHref(categorySlug: string) {
  return `/products/${categorySlug}`
}

export function productSubcategoryHref(
  categorySlug: string,
  subcategory: string,
) {
  return `/products/${categorySlug}/${subcategorySlug(subcategory)}`
}

/** Category index links for nav / sitemaps. */
export const PRODUCT_ROUTES = PRODUCT_CATEGORIES.map(c => ({
  href: productCategoryHref(c.slug),
  label: c.name,
}))

/**
 * Full product nav tree aligned with catalog routes:
 * `/products/{slug}` and `/products/{slug}/{subcategory-slug}`.
 */
export const PRODUCT_NAV = PRODUCT_CATEGORIES.map(c => ({
  name: c.slug,
  label: c.name,
  href: productCategoryHref(c.slug),
  icon: c.icon ?? 'icon-rebar',
  items: c.subcategories.map(sub => ({
    label: sub,
    href: productSubcategoryHref(c.slug, sub),
  })),
}))

export const BRANDS = [
  'Caspian Steel Mills',
  'Hormoz Rolling Co.',
  'Alborz Metal Works',
  'Persian Gulf Steel',
  'Zagros Alloy',
]

/** Common rebar diameters (mm) for filter chips. */
export const REBAR_SIZES = [
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
  '25',
  '28',
  '32',
]

/** Common beam section labels for filter chips (aligned with seed catalog). */
export const BEAM_SIZES = [
  'IPE 80',
  'IPE 100',
  'IPE 120',
  'IPE 140',
  'IPE 160',
  'IPE 180',
  'IPE 200',
  'HEA 100',
  'HEA 140',
  'HEB 120',
]

/** Empty fallback when API is down — prefer live seed data. */
export const SAMPLE_PRODUCTS: Product[] = []
