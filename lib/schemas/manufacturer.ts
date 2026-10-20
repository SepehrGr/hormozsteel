import { z } from 'zod'

import { blankOr } from '@/lib/schemas/fields'
import { isValidSlug, slugify } from '@/lib/slug'

/**
 * The rules for a manufacturer (mill), shared by the admin form and its
 * Server Actions. Input is what the form holds (empty strings); output is what
 * Prisma writes (`null` for blanks, a slug derived from the name when empty).
 * `logo` isn't edited in the admin, so it's left out and updates keep it.
 */
export const manufacturerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    slug: z.string().trim(),
    description: z.string().trim().max(1000),
    // Rendered as a link on /manufacturers/[slug], so only http(s) is allowed
    // Messages sit on the formats: a failed union reports its closest option's error
    website: blankOr(
      z.url({
        protocol: /^https?$/,
        error: 'Use a full address starting with https://',
      }),
    ),
    email: blankOr(z.email({ error: 'Enter a valid email address' })),
    phone: z.string().trim().max(40),
    address: z.string().trim().max(300),
  })
  .transform(({ name, slug, description, website, email, phone, address }) => ({
    name,
    slug: slug || slugify(name),
    description: description || null,
    website: website || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
  }))
  .refine(manufacturer => isValidSlug(manufacturer.slug), {
    path: ['slug'],
    error: 'Use lowercase letters, numbers, and single hyphens',
  })

/** What the form holds. */
export type ManufacturerFormValues = z.input<typeof manufacturerSchema>
/** What gets written to the database. */
export type ManufacturerData = z.output<typeof manufacturerSchema>
