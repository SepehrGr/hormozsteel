'use server'

import { ContactFormStatus, QuickOrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { adminAction } from '@/lib/actions'

const id = z.string().min(1)

export const updateQuickOrderStatus = adminAction(
  z.object({ id, status: z.enum(QuickOrderStatus) }),
  async ({ id, status }, { tx, audit }) => {
    await tx.quickOrder.update({ where: { id }, data: { status } })
    await audit('UPDATE', 'QuickOrder', id, { status })
    revalidatePath('/admin/orders')
  },
)

export const deleteQuickOrder = adminAction(
  z.object({ id }),
  async ({ id }, { tx, audit }) => {
    const order = await tx.quickOrder.delete({ where: { id } })

    await audit('DELETE', 'QuickOrder', id, { customer: order.customerName })
    revalidatePath('/admin/orders')
  },
)

export const updateContactStatus = adminAction(
  z.object({ id, status: z.enum(ContactFormStatus) }),
  async ({ id, status }, { tx, audit }) => {
    await tx.contactForm.update({
      where: { id },
      data: { status, repliedAt: status === 'REPLIED' ? new Date() : null },
    })
    await audit('UPDATE', 'ContactForm', id, { status })
    revalidatePath('/admin/orders')
  },
)

export const deleteContactMessage = adminAction(
  z.object({ id }),
  async ({ id }, { tx, audit }) => {
    const message = await tx.contactForm.delete({ where: { id } })

    await audit('DELETE', 'ContactForm', id, { name: message.name })
    revalidatePath('/admin/orders')
  },
)
