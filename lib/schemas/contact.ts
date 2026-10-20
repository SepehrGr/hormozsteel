import { z } from 'zod'

import { blankOr, phone } from '@/lib/schemas/fields'

/**
 * A message from the contact page, shared by its form and the
 * `sendContactMessage` Server Action. Output is Prisma's shape (`null` for a
 * blank email, stored lowercase).
 */
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    phone: phone(),
    email: blankOr(z.email({ error: 'Enter a valid email address' })),
    message: z.string().trim().min(1, 'Tell sales what you need').max(5000),
  })
  .transform(({ email, ...rest }) => ({
    ...rest,
    email: email.toLowerCase() || null,
  }))

/** What the form holds. */
export type ContactFormValues = z.input<typeof contactSchema>
