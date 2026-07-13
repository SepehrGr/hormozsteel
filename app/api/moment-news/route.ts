import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment-jalaali';

// تنظیم moment برای فارسی
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

export async function GET() {
  try {
    // تاریخ شروع امروز (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // دریافت تمام تغییرات قیمت امروز
    const priceChanges = await prisma.priceHistory.findMany({
      where: {
        changedAt: {
          gte: today,
        },
      },
      orderBy: {
        changedAt: 'desc', // جدیدترین‌ها اول
      },
    });

    // دریافت اطلاعات محصولات مربوطه
    const productIds = Array.from(
      new Set(priceChanges.map((change) => change.productId))
    );
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // ساخت map برای دسترسی سریع به محصولات
    const productsMap = new Map(products.map((p) => [p.id, p]));

    // فرمت کردن داده‌ها
    const formattedChanges = priceChanges
      .map((change) => {
        const product = productsMap.get(change.productId);

        // اگر محصول حذف شده، skip کن
        if (!product) {
          return null;
        }

        return {
          id: change.id,
          productId: change.productId, // اضافه کردن productId برای فیلتر کردن
          time: moment(change.changedAt).format('HH:mm:ss'),
          jalaliDate: moment(change.changedAt).format('jYYYY/jMM/jDD'),
          jalaliDateTime: moment(change.changedAt).format(
            'dddd jD jMMMM jYYYY - HH:mm:ss'
          ),
          productName: product.name,
          brand: product.brand || '-',
          size: product.size || '-',
          category: product.category?.name || '-',
          subcategory: product.subcategory || '-',
          oldPrice: change.oldPrice,
          newPrice: change.newPrice,
          changeType: change.changeType,
          changeAmount: change.changeAmount,
          notes: change.notes,
        };
      })
      .filter((change) => change !== null); // حذف محصولات null (حذف شده)

    // فیلتر کردن: فقط آخرین تغییر هر محصول را نگه دار
    const latestChangesMap = new Map();
    formattedChanges.forEach((change) => {
      if (change) {
        // اگر این محصول قبلاً ندیده‌ایم یا این تغییر جدیدتر است
        if (!latestChangesMap.has(change.productId)) {
          latestChangesMap.set(change.productId, change);
        }
      }
    });

    // تبدیل Map به Array
    const uniqueChanges = Array.from(latestChangesMap.values());

    // خلاصه تغییرات
    const summary = {
      totalChanges: uniqueChanges.length,
      increases: uniqueChanges.filter((c) => c.changeType === 'افزایش').length,
      decreases: uniqueChanges.filter((c) => c.changeType === 'کاهش').length,
      stable: uniqueChanges.filter((c) => c.changeType === 'ثابت').length,
    };

    return NextResponse.json({
      success: true,
      date: moment().format('dddd jD jMMMM jYYYY'),
      summary,
      changes: uniqueChanges,
    });
  } catch (error) {
    console.error('Error fetching moment news:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}
