import type { Session } from 'next-auth'

import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import { unstable_rethrow } from 'next/navigation'
import { z } from 'zod'

import {
  logAdminAction,
  requireAuth,
  requireSuperAdmin,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import {
  checkApiRateLimit,
  checkSubmitRateLimit,
  getClientIP,
} from '@/lib/rate-limit'

/** Same envelope the API routes use, so clients handle both alike. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false
      error: string
      /** Per-field zod messages, keyed by form field name. */
      fieldErrors?: Record<string, string[] | undefined>
    }

/**
 * Throw from a handler for an expected failure; its message reaches the user,
 * and also shows under `field` when given.
 */
export class ActionError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message)
  }
}

const TOO_MANY = {
  success: false,
  error: 'Too many requests. Try again later.',
} as const

/**
 * The result for input that failed `schema`, with each field's messages. An
 * error on the input as a whole (say, an empty list) becomes the message.
 */
const invalidInput = (error: z.ZodError) => {
  const { formErrors, fieldErrors } = z.flattenError(error)

  return {
    success: false,
    error: formErrors[0] ?? 'Check the highlighted fields.',
    fieldErrors,
  } as const
}

interface ActionContext {
  session: Session
  tx: Prisma.TransactionClient
  /** Write an AdminLog row attributed to the current user and request. */
  audit: (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Prisma.InputJsonValue,
  ) => Promise<void>
}

/**
 * Wrap an admin mutation for use as a Server Action.
 *
 * Every Server Action is a public POST endpoint, reachable without the UI, so
 * each call runs: auth → rate limit → zod parse → handler. Expected failures
 * come back as `{ success: false }`; nothing throws to the client except
 * Next's own redirect/notFound control flow.
 *
 * The handler runs in one transaction with its audit row: write through `tx`,
 * and don't redirect from it (that throws, which rolls the writes back).
 *
 * ```ts
 * 'use server'
 * export const createCategory = adminAction(categorySchema, async (data, { tx, audit }) => {
 *   const category = await tx.category.create({ data })
 *   await audit('CREATE', 'Category', category.id)
 *   revalidatePath('/admin/categories')
 * })
 * ```
 */
export function adminAction<S extends z.ZodType, T>(
  schema: S,
  handler: (input: z.output<S>, ctx: ActionContext) => Promise<T>,
  { superAdmin = false } = {},
) {
  return async (input: z.input<S>): Promise<ActionResult<T>> => {
    // Outside the try: these redirect by throwing, and must reach Next.
    const session = superAdmin ? await requireSuperAdmin() : await requireAuth()
    const requestHeaders = await headers()

    if (checkApiRateLimit(getClientIP(requestHeaders)).isLimited) {
      return TOO_MANY
    }

    const parsed = schema.safeParse(input)

    if (!parsed.success) return invalidInput(parsed.error)

    try {
      const data = await prisma.$transaction(tx =>
        handler(parsed.data, {
          session,
          tx,
          audit: (action, type, id, details) =>
            logAdminAction(
              session.user.id,
              action,
              type,
              id,
              details,
              requestHeaders,
              tx,
            ),
        }),
      )

      return { success: true, data }
    } catch (error) {
      unstable_rethrow(error)
      if (error instanceof ActionError) {
        return {
          success: false,
          error: error.message,
          fieldErrors: error.field
            ? { [error.field]: [error.message] }
            : undefined,
        }
      }
      console.error('Server action failed:', error)

      return { success: false, error: prismaErrorMessage(error) }
    }
  }
}

/**
 * Wrap a public form's write (no login) for use as a Server Action:
 * rate limit (the tighter form counter) → zod parse → handler.
 *
 * ```ts
 * 'use server'
 * export const sendContactMessage = publicAction(contactSchema, async data =>
 *   prisma.contactForm.create({ data, select: { id: true } }),
 * )
 * ```
 */
export function publicAction<S extends z.ZodType, T>(
  schema: S,
  handler: (input: z.output<S>) => Promise<T>,
) {
  return async (input: z.input<S>): Promise<ActionResult<T>> => {
    if (checkSubmitRateLimit(getClientIP(await headers())).isLimited) {
      return TOO_MANY
    }

    const parsed = schema.safeParse(input)

    if (!parsed.success) return invalidInput(parsed.error)

    try {
      return { success: true, data: await handler(parsed.data) }
    } catch (error) {
      console.error('Public action failed:', error)

      return { success: false, error: 'Could not send. Please try again.' }
    }
  }
}

/** Turn the Prisma errors a user can cause into something they can act on. */
function prismaErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = error.meta?.target
        const field = Array.isArray(target) ? target.join(', ') : 'value'

        return `That ${field} is already taken.`
      }
      case 'P2003':
        return 'Other records still depend on this one.'
      case 'P2025':
        return 'This record no longer exists. Refresh and try again.'
    }
  }

  return 'Something went wrong. Please try again.'
}
