// Pure string helpers: safe to import from client components.
// The database-backed `generateUniqueSlug` stays in `lib/slug-generator.ts`.

/** Lowercase letters and digits, joined by single hyphens: `hot-rolled-coil`. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value)
}

/** `'Hot Rolled  Coil!'` → `'hot-rolled-coil'`; empty if nothing usable is left. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}
