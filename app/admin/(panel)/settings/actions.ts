'use server'

import { revalidatePath } from 'next/cache'

import { ActionError, adminAction } from '@/lib/actions'
import { checkPassword, hashPassword } from '@/lib/auth'
import { DEMO_ACCOUNT_LOCKED, isDemoAccount } from '@/lib/demo'
import { pluralize } from '@/lib/format'
import { profileSchema } from '@/lib/schemas/user'

export const updateProfile = adminAction(
  profileSchema,
  async ({ currentPassword, password, ...data }, { session, tx, audit }) => {
    const user = await tx.user.findUnique({ where: { id: session.user.id } })

    if (!user) throw new ActionError('Your account no longer exists.')

    if (data.email !== user.email || password) {
      if (isDemoAccount(user.email)) throw new ActionError(DEMO_ACCOUNT_LOCKED)

      if (!currentPassword) {
        throw new ActionError('Enter your current password', 'currentPassword')
      }

      const check = await checkPassword(user, currentPassword)

      if (check.status === 'locked') {
        throw new ActionError(
          `Too many wrong passwords. Try again in ${pluralize(check.minutes, 'minute')}.`,
          'currentPassword',
        )
      }
      if (check.status === 'wrong') {
        throw new ActionError('That password is wrong', 'currentPassword')
      }
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        ...data,
        password: password && (await hashPassword(password)),
      },
      select: { id: true },
    })

    await audit('UPDATE', 'User', user.id, {
      ...data,
      passwordChanged: Boolean(password),
    })
    revalidatePath('/admin/settings')
    revalidatePath('/admin/users')
  },
)
