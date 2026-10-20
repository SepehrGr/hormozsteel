'use server'

import type { Prisma } from '@prisma/client'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ActionError, adminAction } from '@/lib/actions'
import { setProductPrice } from '@/lib/price-updater'
import { resolveManufacturerId } from '@/lib/manufacturer'
import {
  type ProductData,
  productChangesSchema,
  productSchema,
} from '@/lib/schemas/product'
import { generateUniqueSlug } from '@/lib/slug-generator'

const productId = z.string().min(1)
const productIds = z.array(productId).min(1)

/** Throw away cached copies of every page that shows products. */
function revalidateProductPages() {
  revalidatePath('/admin/products')
  revalidatePath('/admin/dashboard')
  // The public catalog is cached for an hour (`revalidate = 3600`)
  revalidatePath('/products', 'layout')
}

async function findCategory(tx: Prisma.TransactionClient, id: string) {
  const category = await tx.category.findUnique({
    where: { id },
    select: { subcategories: true },
  })

  if (!category) throw new ActionError('That category no longer exists.')

  return category
}

/** The slug, the mill and a sub-line that belongs to the category. */
async function toProductRow(
  tx: Prisma.TransactionClient,
  { brand, manufacturerId, ...product }: Omit<ProductData, 'price'>,
  id?: string,
) {
  const { subcategories } = await findCategory(tx, product.categoryId)

  if (!subcategories.includes(product.subcategory)) {
    throw new ActionError('Pick a sub-line from the chosen category.')
  }

  // A slug is the public URL: only a rename gets a new one
  const current = id
    ? await tx.product.findUnique({
        where: { id },
        select: { name: true, slug: true },
      })
    : null

  return {
    ...product,
    slug:
      current?.name === product.name
        ? current.slug
        : await generateUniqueSlug(product.name, id, tx),
    manufacturerId: await resolveManufacturerId({ manufacturerId, brand }, tx),
  }
}

export const createProduct = adminAction(
  productSchema,
  async ({ price, ...values }, { tx, audit }) => {
    const product = await tx.product.create({
      data: { ...(await toProductRow(tx, values)), price },
    })

    await audit('CREATE', 'Product', product.id, { name: product.name })
    revalidateProductPages()
  },
)

export const updateProduct = adminAction(
  z.object({ id: productId, values: productSchema }),
  async ({ id, values: { price, ...values } }, { tx, audit }) => {
    await tx.product.update({
      where: { id },
      data: await toProductRow(tx, values, id),
    })
    await setProductPrice(tx, id, price, 'Edited in admin')

    await audit('UPDATE', 'Product', id, { ...values, price })
    revalidateProductPages()
  },
)

/** Bulk edit from the toolbar; the table's inline price and stock edits send one id. */
export const updateProducts = adminAction(
  z.object({
    ids: productIds,
    changes: productChangesSchema,
  }),
  async ({ ids, changes: { price, inStock, categoryId } }, { tx, audit }) => {
    if (categoryId) {
      const { subcategories } = await findCategory(tx, categoryId)

      await tx.product.updateMany({
        where: { id: { in: ids } },
        data: { categoryId },
      })
      await tx.product.updateMany({
        where: {
          id: { in: ids },
          subcategory: { notIn: subcategories },
        },
        data: { subcategory: null },
      })
    }
    if (inStock !== undefined) {
      await tx.product.updateMany({
        where: { id: { in: ids } },
        data: { inStock },
      })
    }
    if (price !== undefined) {
      // ponytail: two queries per product; a single UPDATE … FROM if bulk edits get large
      for (const id of ids) {
        await setProductPrice(tx, id, price, 'Edited in admin')
      }
    }

    await audit('UPDATE', 'Product', undefined, {
      ids,
      price,
      inStock,
      categoryId,
    })
    revalidateProductPages()
  },
)

export const deleteProducts = adminAction(
  z.object({ ids: productIds }),
  async ({ ids }, { tx, audit }) => {
    const products = await tx.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    })

    if (products.length === 0) {
      throw new ActionError('These products no longer exist. Refresh.')
    }

    // Price history and order lines go with them (`onDelete: Cascade`)
    await tx.product.deleteMany({ where: { id: { in: ids } } })

    await audit('DELETE', 'Product', undefined, { products })
    revalidateProductPages()
  },
)
