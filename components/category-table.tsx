'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductCategory } from '@/types/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderRequestModal from '@/components/order-request-modal';
import {
  Calculator,
  Phone,
  Package,
  TrendingUp,
  Heart,
  Share2,
  Eye,
} from 'lucide-react';

interface CategoryTableProps {
  category: ProductCategory;
  products: Product[];
  onOrder: (product: Product) => void;
  onCalculate: (product: Product) => void;
  formatPrice?: (price: number) => string;
}

export default function CategoryTable({
  category,
  products,
  onOrder,
  onCalculate,
  formatPrice: customFormatPrice,
}: CategoryTableProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<{
    name?: string;
    specs?: string;
  } | null>(null);

  // ensure products are ordered from smallest to largest size
  const sortedProducts = React.useMemo(() => {
    // copy to avoid mutating original
    return [...products].sort((a, b) => {
      const na = parseFloat(a.size);
      const nb = parseFloat(b.size);
      if (!isNaN(na) && !isNaN(nb)) {
        if (na === nb) {
          // fallback to name for equal numeric sizes
          return a.name.localeCompare(b.name);
        }
        return na - nb; // ascending numeric
      }
      // if not numeric, compare as strings
      return a.size.localeCompare(b.size);
    });
  }, [products]);

  const openOrderModal = (product: Product) => {
    setSelectedProductForOrder({
      name: product.name,
      specs: product.description || '',
    });
    setIsOrderModalOpen(true);
  };
  const formatPrice =
    customFormatPrice ||
    ((price: number) => {
      return new Intl.NumberFormat('fa-IR').format(price);
    });

  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Desktop table layout */}
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-2 py-3 font-semibold text-right text-slate-700 dark:text-slate-300">
                  محصول
                </th>
                <th className="px-2 py-3 font-semibold text-center align-middle text-slate-700 dark:text-slate-300">
                  سایز
                </th>
                <th className="px-2 py-3 font-semibold text-center text-slate-700 dark:text-slate-300">
                  وزن
                </th>
                <th className="px-2 py-3 font-semibold text-center text-slate-700 dark:text-slate-300">
                  قیمت (تومان)
                </th>
                <th className="px-2 py-3 font-semibold text-center text-slate-700 dark:text-slate-300">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-2 py-4">
                    <div className="overflow-hidden">
                      <div className="text-lg font-medium truncate text-slate-900 dark:text-slate-100">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm truncate text-slate-500 dark:text-slate-400">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center align-middle">
                    <div className="flex items-center justify-center h-full">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium border rounded-full shadow-sm bg-white/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                        {product.size}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {product.weight ? product.weight : '-'}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {product.price > 0
                        ? formatPrice(product.price)
                        : 'تماس بگیرید'}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOrderModal(product)}
                          className="flex items-center gap-1 text-xs cursor-pointer"
                        >
                          ثبت سفارش
                        </Button>
                        <OrderRequestModal
                          isOpen={isOrderModalOpen}
                          onClose={() => setIsOrderModalOpen(false)}
                          productName={selectedProductForOrder?.name}
                          productSpecs={selectedProductForOrder?.specs}
                        />
                      </>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile table layout */}
          <table className="w-full table-fixed lg:hidden">
            <colgroup>
              <col style={{ width: '55%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-2 py-3 font-semibold text-right text-slate-700 dark:text-slate-300">
                  محصول
                </th>
                <th className="px-2 py-3 font-semibold text-center text-slate-700 dark:text-slate-300">
                  قیمت
                </th>
                <th className="px-2 py-3 font-semibold text-center text-slate-700 dark:text-slate-300">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr
                  key={`mobile-${product.id}`}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-2 py-4">
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium leading-snug line-clamp-2 text-slate-900 dark:text-slate-100">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="whitespace-nowrap">سایز:</span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                          {product.size}
                        </span>
                      </div>
                      {product.weight && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="whitespace-nowrap">وزن:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {product.weight}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center">
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {product.price > 0
                        ? formatPrice(product.price)
                        : 'تماس بگیرید'}
                    </div>
                  </td>
                  <td className="px-1 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOrderModal(product)}
                          className="flex items-center gap-1 px-2 text-xs cursor-pointer"
                        >
                          <Package className="w-3 h-3" />
                        </Button>
                        <OrderRequestModal
                          isOpen={isOrderModalOpen}
                          onClose={() => setIsOrderModalOpen(false)}
                          productName={selectedProductForOrder?.name}
                          productSpecs={selectedProductForOrder?.specs}
                        />
                      </>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="py-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400">
              محصولی در این دسته‌بندی یافت نشد
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
