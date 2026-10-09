'use server'

import type { Prisma } from '@prisma/client'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ActionError, adminAction } from '@/lib/actions'
import { createUserSchema, updateUserSchema } from '@/lib/schemas/user'

const userId = z.string().min(1)
const superAdmin = { superAdmin: true }

const LAST_SUPER_ADMIN = 'There must always be at least one active super admin.'

/** Cost 12, as the old API used; each hash stores its own cost, so login checks any. */
const hashPassword = (password: string) => bcrypt.hash(password, 12)

/** Read only what the guards need; the password hash is never selected. */
async function findUser(tx: Prisma.TransactionClient, id: string) {
  const user = await tx.user.findUnique({
    where: { id },
    select: { email: true, name: true, role: true, isActive: true },
  })

  if (!user) throw new ActionError('This user no longer exists. Refresh.')

  return user
}

/**
 * True when no other active super admin exists, so this one can't lose the
 * role, be deactivated, or be deleted.
 * ponytail: check-then-write at Read Committed, so two simultaneous demotions
 * could both pass; give these actions `isolationLevel: 'Serializable'` if that
 * ever matters.
 */
async function isLastSuperAdmin(tx: Prisma.TransactionClient, id: string) {
  const others = await tx.user.count({
    where: { role: 'SUPER_ADMIN', isActive: true, id: { not: id } },
  })

  return others === 0
}

export const createUser = adminAction(
  createUserSchema,
  async ({ password, ...data }, { tx, audit }) => {
    const user = await tx.user.create({
      data: { ...data, password: await hashPassword(password) },
      select: { id: true },
    })

    await audit('CREATE', 'User', user.id, data)
    revalidatePath('/admin/users')
  },
  superAdmin,
)

export const updateUser = adminAction(
  z.object({ id: userId, values: updateUserSchema }),
  async ({ id, values: { password, ...data } }, { session, tx, audit }) => {
    const existing = await findUser(tx, id)

    if (id === session.user.id) {
      if (data.role !== existing.role) {
        throw new ActionError('You cannot change your own role.')
      }
      if (!data.isActive) {
        throw new ActionError('You cannot deactivate your own account.')
      }
    }

    const wasActiveSuperAdmin =
      existing.role === 'SUPER_ADMIN' && existing.isActive
    const staysActiveSuperAdmin = data.role === 'SUPER_ADMIN' && data.isActive

    if (
      wasActiveSuperAdmin &&
      !staysActiveSuperAdmin &&
      (await isLastSuperAdmin(tx, id))
    ) {
      throw new ActionError(LAST_SUPER_ADMIN)
    }

    await tx.user.update({
      where: { id },
      data: {
        ...data,
        // undefined (blank in the form) leaves the current hash alone
        password: password && (await hashPassword(password)),
      },
      select: { id: true },
    })

    // Never log the password itself, only that it changed
    await audit('UPDATE', 'User', id, {
      ...data,
      passwordChanged: Boolean(password),
    })
    revalidatePath('/admin/users')
  },
  superAdmin,
)

/** Lift a failed-login lockout early; the next login starts from zero attempts. */
export const unlockUser = adminAction(
  z.object({ id: userId }),
  async ({ id }, { tx, audit }) => {
    // A missing user is P2025, which adminAction turns into a message
    await tx.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
      select: { id: true },
    })

    await audit('UNLOCK', 'User', id)
    revalidatePath('/admin/users')
  },
  superAdmin,
)

export const deleteUser = adminAction(
  z.object({ id: userId }),
  async ({ id }, { session, tx, audit }) => {
    if (id === session.user.id) {
      throw new ActionError('You cannot delete your own account.')
    }

    const existing = await findUser(tx, id)

    if (
      existing.role === 'SUPER_ADMIN' &&
      existing.isActive &&
      (await isLastSuperAdmin(tx, id))
    ) {
      throw new ActionError(LAST_SUPER_ADMIN)
    }

    await tx.user.delete({ where: { id }, select: { id: true } })

    await audit('DELETE', 'User', id, {
      email: existing.email,
      name: existing.name,
    })
    revalidatePath('/admin/users')
  },
  superAdmin,
)
