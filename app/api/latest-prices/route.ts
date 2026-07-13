import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // دریافت محصولاتی که اخیراً قیمت‌شان تغییر کرده
    const recentPriceChanges = await prisma.priceHistory.findMany({
      orderBy: {
        changedAt: 'desc',
      },
      take: 50, // تعداد بیشتر برای فیلتر کردن duplicates
      select: {
        productId: true,
        newPrice: true,
        changedAt: true,
        changeType: true,
        changeAmount: true,
      },
    });

    // گرفتن IDs یونیک محصولات
    const uniqueProductIds = Array.from(
      new Set(recentPriceChanges.map((change) => change.productId))
    ).slice(0, 12); // فقط 12 محصول اول

    // دریافت اطلاعات کامل محصولات
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });

    // ایجاد map برای دسترسی به آخرین تغییر قیمت
    const priceChangesMap = new Map();
    recentPriceChanges.forEach((change) => {
      if (!priceChangesMap.has(change.productId)) {
        priceChangesMap.set(change.productId, change);
      }
    });

    // فرمت کردن داده‌ها مطابق با نوع Product
    const formattedProducts = products.map((product) => {
      const priceChange = priceChangesMap.get(product.id);

      return {
        id: product.id,
        name: product.name,
        brand: product.brand || '',
        category: product.category?.name || 'متفرقه',
        categoryIcon: product.category?.icon || 'icon-rebar',
        subcategory: product.subcategory || '',
        size: product.size || '',
        grade: product.grade || '',
        price: product.price,
        unit: product.unit || 'تومان',
        inStock: product.inStock,
        image:
          product.images && product.images.length > 0 ? product.images[0] : '',
        description: product.description || '',
        specifications: product.specifications || {},
        lastUpdated: product.updatedAt.toISOString(),
        priceHistory: priceChange
          ? {
              changeType: priceChange.changeType,
              changeAmount: priceChange.changeAmount,
              changedAt: priceChange.changedAt.toISOString(),
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}
