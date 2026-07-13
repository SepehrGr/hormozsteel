import { prisma } from './prisma'

/**
 * تابع برای آپدیت قیمت محصول و ثبت تاریخچه تغییرات
 * از Transaction استفاده می‌کند تا عملیات atomic باشد
 * @param productId - شناسه محصول
 * @param newPrice - قیمت جدید
 * @param notes - یادداشت اختیاری
 * @returns نتیجه عملیات
 */
export async function updateProductPrice(
  productId: string,
  newPrice: number,
  notes?: string
) {
  try {
    // استفاده از Transaction برای atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // 1. دریافت اطلاعات فعلی محصول
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new Error('محصول یافت نشد')
      }

      const oldPrice = product.price

      // محاسبه تغییرات
      const changeAmount = Math.abs(newPrice - oldPrice)
      let changeType = 'ثابت'

      if (newPrice > oldPrice) {
        changeType = 'افزایش'
      } else if (newPrice < oldPrice) {
        changeType = 'کاهش'
      }

      // 2. ثبت در تاریخچه تغییرات قیمت
      await tx.priceHistory.create({
        data: {
          productId,
          oldPrice,
          newPrice,
          changeType,
          changeAmount,
          notes,
          changedAt: new Date(),
        },
      })

      // 3. آپدیت اطلاعات محصول
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          price: newPrice,
          previousPrice: oldPrice,
          changeType:
            changeType === 'ثابت'
              ? 'stable'
              : changeType === 'افزایش'
                ? 'increase'
                : 'decrease',
          changeAmount,
          lastPriceChange:
            changeType !== 'ثابت' ? new Date() : product.lastPriceChange,
        },
      })

      return {
        product: updatedProduct,
        change: {
          oldPrice,
          newPrice,
          changeType,
          changeAmount,
        },
      }
    })

    return {
      success: true,
      ...result,
    }
  } catch (error) {
    console.error('Error updating product price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در بروزرسانی قیمت',
    }
  }
}

/**
 * تابع برای آپدیت دسته‌ای قیمت محصولات
 * از Transaction استفاده می‌کند برای عملیات atomic
 * @param updates - آرایه‌ای از آپدیت‌ها شامل productId و newPrice
 * @returns نتیجه عملیات
 */
export async function bulkUpdateProductPrices(
  updates: Array<{ productId: string; newPrice: number; notes?: string }>
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Process each update sequentially (for better error handling)
  // Alternative: use Promise.allSettled for parallel processing
  for (const update of updates) {
    const result = await updateProductPrice(
      update.productId,
      update.newPrice,
      update.notes
    )

    if (result.success) {
      results.success++
    } else {
      results.failed++
      results.errors.push(`محصول ${update.productId}: ${result.error}`)
    }
  }

  return results
}
