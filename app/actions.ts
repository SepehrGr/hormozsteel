'use server'

import { publicAction } from '@/lib/actions'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/schemas/contact'
import { quickOrderSchema } from '@/lib/schemas/quick-order'

export const sendContactMessage = publicAction(contactSchema, async data =>
  prisma.contactForm.create({ data, select: { id: true } }),
)

export const requestQuote = publicAction(quickOrderSchema, async data =>
  prisma.quickOrder.create({ data, select: { id: true } }),
)
