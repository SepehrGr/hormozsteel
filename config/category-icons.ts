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
  wire: 'icon-Wire-products',
  mesh: 'icon-grating',
  shamsh: 'icon-bullion',
  qooti: 'icon-profil',
  'raw-materials': 'icon-stainless-steel',
} as const

export type CategoryIconSlug = keyof typeof CATEGORY_ICONS

export const DEFAULT_CATEGORY_ICON = 'icon-rebar'

/** Resolve icomoon class from slug or raw DB value (always returns a class, never emoji). */
export function resolveCategoryIcon(
  slugOrClass?: string | null,
): string {
  if (!slugOrClass) return DEFAULT_CATEGORY_ICON
  if (slugOrClass.startsWith('icon-')) return slugOrClass
  if (slugOrClass in CATEGORY_ICONS) {
    return CATEGORY_ICONS[slugOrClass as CategoryIconSlug]
  }
  return DEFAULT_CATEGORY_ICON
}
