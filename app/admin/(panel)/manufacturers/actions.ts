'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { adminAction } from '@/lib/actions'
import { manufacturerSchema } from '@/lib/schemas/manufacturer'

const manufacturerId = z.string().min(1)

/** Throw away cached copies of every page that shows manufacturers. */
function revalidateManufacturerPages() {
  revalidatePath('/admin/manufacturers')
  // Product pages show the mill name and are cached for an hour
  revalidatePath('/products', 'layout')
}

export const createManufacturer = adminAction(
  manufacturerSchema,
  async (data, { tx, audit }) => {
    const manufacturer = await tx.manufacturer.create({ data })

    await audit('CREATE', 'Manufacturer', manufacturer.id, {
      name: manufacturer.name,
    })
    revalidateManufacturerPages()
  },
)

export const updateManufacturer = adminAction(
  z.object({ id: manufacturerId, values: manufacturerSchema }),
  async ({ id, values }, { tx, audit }) => {
    await tx.manufacturer.update({ where: { id }, data: values })

    await audit('UPDATE', 'Manufacturer', id, values)
    revalidateManufacturerPages()
  },
)

export const deleteManufacturer = adminAction(
  z.object({ id: manufacturerId }),
  async ({ id }, { tx, audit }) => {
    // Its products stay: Product.manufacturer is `onDelete: SetNull`, so the
    // database clears their link and they show no mill.
    const manufacturer = await tx.manufacturer.delete({ where: { id } })

    await audit('DELETE', 'Manufacturer', id, { name: manufacturer.name })
    revalidateManufacturerPages()
  },
)
