/**
 * Icomoon CSS class names for product categories.
 * Must match styles/icomoon.css and Category.icon in the database.
 */
export const CATEGORY_ICONS = {
  rebar: 'icon-rebar',
  beam: 'icon-girder',
  sheet: 'icon-sheet',
  profile: 'icon-profile',
  angle: 'icon-Corners',
  pipe: 'icon-pipe',
  wire: 'icon-wire',

  mesh: 'icon-grating',
  shamsh: 'icon-bullion',
  qooti: 'icon-profil',
  'raw-materials': 'icon-stainless-steel',
} as const

export type CategoryIconSlug = keyof typeof CATEGORY_ICONS

export const DEFAULT_CATEGORY_ICON = 'icon-rebar'

/** Legacy glyph that rendered oversized vs the rest of the set. */
const ICON_ALIASES: Record<string, string> = {
  'icon-Wire-products': 'icon-wire',
}

/** Resolve icomoon class from slug or raw DB value (always returns a class, never emoji). */
export function resolveCategoryIcon(slugOrClass?: string | null): string {
  if (!slugOrClass) return DEFAULT_CATEGORY_ICON
  if (slugOrClass in ICON_ALIASES) return ICON_ALIASES[slugOrClass]
  if (slugOrClass.startsWith('icon-')) return slugOrClass
  if (slugOrClass in CATEGORY_ICONS) {
    return CATEGORY_ICONS[slugOrClass as CategoryIconSlug]
  }

  return DEFAULT_CATEGORY_ICON
}
