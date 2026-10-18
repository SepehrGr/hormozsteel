import { z } from 'zod'

/** Blank, or a number above 0 (the form keeps number inputs as strings). */
const amount = (noun: string) =>
  z
    .string()
    .trim()
    .refine(value => !value || Number(value) > 0, {
      error: `Enter the ${noun} as a number above 0`,
    })

/**
 * The rules for a product, shared by the admin form and its Server Actions.
 * Input is what the form holds (strings, `''` for blanks); output is what
 * Prisma writes. The mill is either a picked `manufacturerId` or a typed
 * `brand`, which the action turns into a manufacturer. Checks that need the
 * database (the category exists, the sub-line belongs to it) live in the action.
 */
export const productSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    manufacturerId: z.string(),
    brand: z.string().trim().max(120),
    size: z.string().trim().max(40),
    price: amount('price').refine(Boolean, { error: 'Price is required' }),
    inStock: z.boolean(),
    categoryId: z.string().min(1, 'Pick a category'),
    subcategory: z.string().trim().min(1, 'Pick a sub-line').max(60),
    weight: amount('weight'),
  })
  .refine(product => product.manufacturerId || product.brand, {
    path: ['manufacturerId'],
    error: 'Pick a mill or type its name',
  })
  .transform(({ manufacturerId, brand, price, weight, ...product }) => ({
    ...product,
    price: Number(price),
    weightKg: weight ? Number(weight) : null,
    manufacturerId: manufacturerId || null,
    brand: manufacturerId ? null : brand,
  }))

/** What the form holds. */
export type ProductFormValues = z.input<typeof productSchema>
/** What the actions receive. */
export type ProductData = z.output<typeof productSchema>
