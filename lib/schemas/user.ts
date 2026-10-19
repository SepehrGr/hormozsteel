import { z } from 'zod'

/**
 * Password length rules, shared with the profile page (Phase 6). bcrypt only
 * reads the first 72 bytes, so a longer password would be silently cut off.
 * ponytail: counts characters, not bytes; non-ASCII passwords near 72 can
 * still be cut. Check `new TextEncoder().encode(p).length` if that matters.
 */
export const passwordSchema = z
  .string()
  // Listed first so a blank field shows this, not the length rule
  .min(1, 'Enter a password')
  .min(6, 'Use at least 6 characters')
  .max(72, 'Use at most 72 characters')

/** Matches Prisma's `Role` enum, without importing Prisma into the browser. */
export const ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
}

const userFields = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  // Not lowercased: login matches the stored email exactly
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address' })),
  role: z.enum(ROLES),
  isActive: z.boolean(),
})

/** The sign-in form. No length rule: that's for setting a password, not typing one. */
export const loginSchema = z.object({
  email: userFields.shape.email,
  password: z.string().min(1, 'Enter your password'),
})

export type LoginValues = z.input<typeof loginSchema>

/** Adding an admin: the password is required. */
export const createUserSchema = userFields.extend({ password: passwordSchema })

/**
 * Editing an admin: a blank password means "keep the current one", so it
 * becomes `undefined` and Prisma leaves the column alone.
 */
export const updateUserSchema = userFields
  .extend({ password: z.union([z.literal(''), passwordSchema]) })
  .transform(({ password, ...user }) => ({
    ...user,
    password: password || undefined,
  }))

/** What the add and edit forms hold; both schemas take this same shape. */
export type UserFormValues = z.input<typeof updateUserSchema>

/**
 * Your own profile on /admin/settings. The action decides whether
 * `currentPassword` is needed: only the server knows if the email changed.
 */
export const profileSchema = userFields
  .pick({ name: true, email: true })
  .extend({
    password: z.union([z.literal(''), passwordSchema]),
    confirmPassword: z.string(),
    currentPassword: z.string(),
  })
  .refine(v => v.password === v.confirmPassword, {
    error: "The passwords don't match",
    path: ['confirmPassword'],
  })
  .transform(({ name, email, password, currentPassword }) => ({
    name,
    email,
    password: password || undefined,
    currentPassword,
  }))

export type ProfileFormValues = z.input<typeof profileSchema>
