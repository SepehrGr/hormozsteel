import { z } from 'zod'

import { blankOr, phone } from '@/lib/schemas/fields'

/**
 * A public quote request, shared by the order-request modal and the
 * `requestQuote` Server Action. Input is the form's strings; output is Prisma's
 * shape (`null` for blanks, a `Date` for the delivery date).
 */
export const quickOrderSchema = z
  .object({
    customerName: z.string().trim().min(1, 'Name is required').max(100),
    companyName: z.string().trim().max(100),
    phoneNumber: phone(),
    city: z.string().trim().min(1, 'City is required').max(80),
    productSpecs: z.string().trim().min(1, 'Specs are required').max(500),
    quantity: z.string().trim().min(1, 'Quantity is required').max(50),
    deliveryDate: blankOr(z.iso.date({ error: 'Pick a valid date' })),
    // Prisma's DeliveryMethod, spelled out so the browser bundle stays Prisma-free
    deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
    additionalNotes: z.string().trim().max(2000),
    productName: z.string().trim().max(200),
  })
  .transform(
    ({ companyName, deliveryDate, additionalNotes, productName, ...rest }) => ({
      ...rest,
      companyName: companyName || null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      additionalNotes: additionalNotes || null,
      productName: productName || null,
    }),
  )

/** What the form holds. */
export type QuickOrderFormValues = z.input<typeof quickOrderSchema>
