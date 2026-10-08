import { z } from 'zod'

/**
 * Password length rules, shared with the profile page (Phase 6). bcrypt only
 * reads the first 72 bytes, so a longer password would be silently cut off.
 * ponytail: counts characters, not bytes; non-ASCII passwords near 72 can
 * still be cut. Check `new TextEncoder().encode(p).length` if that matters.
 */
export const passwordSchema = z
  .string()
  .min(6, 'Use at least 6 characters')
  .max(72, 'Use at most 72 characters')

/** Matches Prisma's `Role` enum, without importing Prisma into the browser. */
export const ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

const userFields = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  // Not lowercased: login matches the stored email exactly
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address' })),
  role: z.enum(ROLES),
})

/** Adding an admin: the password is required. */
export const createUserSchema = userFields.extend({ password: passwordSchema })

/**
 * Editing an admin: a blank password means "keep the current one", so it
 * becomes `undefined` and Prisma leaves the column alone.
 */
export const updateUserSchema = userFields
  .extend({
    isActive: z.boolean(),
    password: z.union([z.literal(''), passwordSchema]),
  })
  .transform(({ password, ...user }) => ({
    ...user,
    password: password || undefined,
  }))

/** What the create form holds. */
export type CreateUserValues = z.input<typeof createUserSchema>
/** What the edit form holds. */
export type UpdateUserValues = z.input<typeof updateUserSchema>
/** What an update writes (the password still needs hashing). */
export type UpdateUserData = z.output<typeof updateUserSchema>
