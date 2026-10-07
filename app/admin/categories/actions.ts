'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ActionError, adminAction } from '@/lib/actions'
import { pluralize } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/schemas/category'

const categoryId = z.string().min(1)

/** Throw away cached copies of every page that shows categories. */
function revalidateCategoryPages() {
  revalidatePath('/admin/categories')
  // The public catalog is cached for an hour (`revalidate = 3600`);
  // 'layout' clears /products and every page nested under it.
  revalidatePath('/products', 'layout')
}

export const createCategory = adminAction(
  categorySchema,
  async (data, { audit }) => {
    const category = await prisma.category.create({ data })

    await audit('CREATE', 'Category', category.id, { name: category.name })
    revalidateCategoryPages()
  },
)

export const updateCategory = adminAction(
  z.object({ id: categoryId, values: categorySchema }),
  async ({ id, values }, { audit }) => {
    await prisma.category.update({ where: { id }, data: values })

    await audit('UPDATE', 'Category', id, values)
    revalidateCategoryPages()
  },
)

export const deleteCategory = adminAction(
  z.object({ id: categoryId }),
  async ({ id }, { audit }) => {
    // The schema cascades a category delete to all of its products, so refuse
    // while any are linked.
    // ponytail: count-then-delete can race a product insert; the real fix is
    // onDelete: Restrict on Product.category (DB track W1).
    const products = await prisma.product.count({ where: { categoryId: id } })

    if (products > 0) {
      throw new ActionError(
        `Move or delete its ${pluralize(products, 'product')} first.`,
      )
    }

    const category = await prisma.category.delete({ where: { id } })

    await audit('DELETE', 'Category', id, { name: category.name })
    revalidateCategoryPages()
  },
)
