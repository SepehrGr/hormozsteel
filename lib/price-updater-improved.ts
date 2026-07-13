// بهبود یافته: lib/price-updater-improved.ts با Transaction Support
import { prisma } from './prisma';

interface PriceUpdateResult {
  success: boolean;
  product?: any;
  priceHistory?: any;
  error?: string;
}

/**
 * بروزرسانی قیمت محصول با استفاده از Transaction
 * این تضمین می‌کند که هم محصول و هم تاریخچه قیمت با هم بروز می‌شوند
 */
export async function updateProductPrice(
  productId: string,
  newPrice: number,
  notes?: string
): Promise<PriceUpdateResult> {
  try {
    // Validation
    if (!productId || !productId.trim()) {
      return { success: false, error: 'شناسه محصول الزامی است' };
    }

    if (newPrice <= 0) {
      return { success: false, error: 'قیمت باید مثبت باشد' };
    }

    // استفاده از Transaction برای atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // 1. دریافت محصول فعلی
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      const oldPrice = product.price;

      // اگر قیمت تغییری نکرده، نیازی به بروزرسانی نیست
      if (oldPrice === newPrice) {
        return { product, priceHistory: null, unchanged: true };
      }

      const changeAmount = newPrice - oldPrice;
      const changePercentage = (changeAmount / oldPrice) * 100;
      const changeType =
        changeAmount > 0 ? 'افزایش' : changeAmount < 0 ? 'کاهش' : 'ثابت';

      // 2. بروزرسانی محصول
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          price: newPrice,
          previousPrice: oldPrice,
          changeType,
          changeAmount: Math.abs(changeAmount),
          lastPriceChange: new Date(),
        },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      // 3. ایجاد رکورد تاریخچه قیمت
      const priceHistory = await tx.priceHistory.create({
        data: {
          productId,
          oldPrice,
          newPrice,
          changeType,
          changeAmount: Math.abs(changeAmount),
          changedAt: new Date(),
          notes: notes || `تغییر قیمت: ${changePercentage.toFixed(2)}%`,
        },
      });

      console.log(`✅ قیمت محصول "${product.name}" بروزرسانی شد:`, {
        oldPrice: oldPrice.toLocaleString('fa-IR'),
        newPrice: newPrice.toLocaleString('fa-IR'),
        change: `${changeType} ${Math.abs(changeAmount).toLocaleString('fa-IR')} تومان`,
        percentage: `${changePercentage.toFixed(2)}%`,
      });

      return { product: updatedProduct, priceHistory, unchanged: false };
    });

    if (result.unchanged) {
      return {
        success: true,
        product: result.product,
        error: 'قیمت تغییری نکرده است',
      };
    }

    return {
      success: true,
      product: result.product,
      priceHistory: result.priceHistory,
    };
  } catch (error) {
    console.error('❌ خطا در بروزرسانی قیمت محصول:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}

/**
 * بروزرسانی دسته‌ای قیمت محصولات
 */
export async function bulkUpdatePrices(
  updates: Array<{ productId: string; newPrice: number; notes?: string }>
): Promise<{
  success: boolean;
  results: PriceUpdateResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    unchanged: number;
  };
}> {
  const results: PriceUpdateResult[] = [];
  let successful = 0;
  let failed = 0;
  let unchanged = 0;

  console.log(`🔄 شروع بروزرسانی دسته‌ای ${updates.length} محصول...`);

  for (const update of updates) {
    const result = await updateProductPrice(
      update.productId,
      update.newPrice,
      update.notes
    );

    results.push(result);

    if (result.success) {
      if (result.error?.includes('تغییری نکرده')) {
        unchanged++;
      } else {
        successful++;
      }
    } else {
      failed++;
    }
  }

  console.log(`✅ بروزرسانی دسته‌ای تمام شد:`, {
    total: updates.length,
    successful,
    failed,
    unchanged,
  });

  return {
    success: failed === 0,
    results,
    summary: {
      total: updates.length,
      successful,
      failed,
      unchanged,
    },
  };
}

/**
 * دریافت تاریخچه قیمت یک محصول
 */
export async function getProductPriceHistory(
  productId: string,
  limit = 10
): Promise<{
  success: boolean;
  history?: any[];
  error?: string;
}> {
  try {
    const history = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { changedAt: 'desc' },
      take: limit,
    });

    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error('Error fetching price history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}

/**
 * دریافت آخرین تغییرات قیمت (برای داشبورد)
 *
 * ⚠️ توجه: این فانکشن نیاز به اضافه کردن relation به PriceHistory دارد
 * باید در schema.prisma این تغییرات انجام شود:
 *
 * model PriceHistory {
 *   productId String
 *   product   Product @relation(fields: [productId], references: [id])
 * }
 */
export async function getRecentPriceChanges(limit = 20): Promise<{
  success: boolean;
  changes?: any[];
  error?: string;
}> {
  try {
    const changes = await prisma.priceHistory.findMany({
      take: limit,
      orderBy: { changedAt: 'desc' },
      // TODO: بعد از اضافه کردن relation، این uncomment شود:
      // include: {
      //   product: {
      //     select: {
      //       id: true,
      //       name: true,
      //       slug: true,
      //       brand: true,
      //       category: {
      //         select: {
      //           name: true,
      //           slug: true,
      //         },
      //       },
      //     },
      //   },
      // },
    });

    // موقتاً: دریافت اطلاعات محصولات جداگانه
    const changesWithProducts = await Promise.all(
      changes.map(async (change) => {
        const product = await prisma.product.findUnique({
          where: { id: change.productId },
          select: {
            id: true,
            name: true,
            slug: true,
            brand: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });
        return { ...change, product };
      })
    );

    return {
      success: true,
      changes: changesWithProducts,
    };
  } catch (error) {
    console.error('Error fetching recent price changes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}

/**
 * محاسبه آمار تغییرات قیمت
 */
export async function getPriceChangeStats(days = 7): Promise<{
  success: boolean;
  stats?: {
    totalChanges: number;
    increases: number;
    decreases: number;
    avgChangePercentage: number;
    topIncreases: any[];
    topDecreases: any[];
  };
  error?: string;
}> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const changes = await prisma.priceHistory.findMany({
      where: {
        changedAt: {
          gte: sinceDate,
        },
      },
      // TODO: بعد از اضافه کردن relation، uncomment شود:
      // include: {
      //   product: {
      //     select: {
      //       name: true,
      //       brand: true,
      //     },
      //   },
      // },
      orderBy: { changedAt: 'desc' },
    });

    const increases = changes.filter((c) => c.changeType === 'افزایش');
    const decreases = changes.filter((c) => c.changeType === 'کاهش');

    const avgChangePercentage =
      changes.length > 0
        ? changes.reduce((sum, c) => {
            const pct = (c.changeAmount / c.oldPrice) * 100;
            return sum + (c.changeType === 'کاهش' ? -pct : pct);
          }, 0) / changes.length
        : 0;

    const topIncreases = [...increases]
      .sort((a, b) => b.changeAmount - a.changeAmount)
      .slice(0, 5);

    const topDecreases = [...decreases]
      .sort((a, b) => b.changeAmount - a.changeAmount)
      .slice(0, 5);

    return {
      success: true,
      stats: {
        totalChanges: changes.length,
        increases: increases.length,
        decreases: decreases.length,
        avgChangePercentage,
        topIncreases,
        topDecreases,
      },
    };
  } catch (error) {
    console.error('Error calculating price change stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}
