import { z } from 'zod'

import { CATEGORY_ICONS } from '@/config/category-icons'
import { isValidSlug, slugify } from '@/lib/slug-generator'

/**
 * The rules for a category, shared by the admin form and its Server Actions.
 *
 * Input is what the form holds: empty strings, and `{ value }` rows because
 * `useFieldArray` needs objects. Output is what Prisma writes: `null` for
 * blanks, a plain `string[]`, and a slug derived from the name when left empty.
 *
 * The form runs it for instant feedback; the action runs it again, because a
 * Server Action is a public endpoint and can't trust what the browser sends.
 */
export const categorySchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80),
    slug: z.string().trim(),
    icon: z.union([z.literal(''), z.enum(Object.values(CATEGORY_ICONS))], {
      error: 'Pick an icon from the list',
    }),
    description: z.string().trim().max(500),
    subcategories: z.array(z.object({ value: z.string().trim().max(60) })),
  })
  .transform(({ name, slug, icon, description, subcategories }) => ({
    name,
    slug: slug || slugify(name),
    icon: icon || null,
    description: description || null,
    // Blank rows dropped, duplicates collapsed (they're React keys in the table)
    subcategories: [
      ...new Set(subcategories.map(sub => sub.value).filter(Boolean)),
    ],
  }))
  .refine(category => isValidSlug(category.slug), {
    path: ['slug'],
    error: 'Use lowercase letters, numbers, and single hyphens',
  })

/** What the form holds. */
export type CategoryFormValues = z.input<typeof categorySchema>
/** What gets written to the database. */
export type CategoryData = z.output<typeof categorySchema>
