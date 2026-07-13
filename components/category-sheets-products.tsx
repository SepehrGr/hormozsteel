'use client';

import React, { useState, useMemo, useEffect } from 'react';
import CategoryTable from '@/components/category-table';
import { Product, ProductCategory } from '@/types/products';

interface SheetsProduct {
  id: string;
  name: string;
  size: string;
  price: string;
  inStock: boolean;
  unit: string;
  description: string;
  brand?: string;
  subcategory?: string;
}

interface CategorySheetsProductsProps {
  category: ProductCategory;
}

export default function CategorySheetsProducts({
  category,
}: CategorySheetsProductsProps) {
  const [sheetsProducts, setSheetsProducts] = useState<SheetsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  // دریافت محصولات از Google Sheets
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sheets-products');
      const result = await response.json();

      if (result.success) {
        // فیلتر کردن محصولات مربوط به این دسته‌بندی
        const categoryProducts = result.data.filter(
          (product: SheetsProduct) => {
            const productName = product.name.toLowerCase();
            const categoryName = category.name.toLowerCase();

            // برای دسته ورق
            if (category.id === 'sheet') {
              return (
                productName.includes('ورق') ||
                productName.includes('شیت') ||
                productName.includes('صفحه')
              );
            }

            // برای میلگرد
            if (category.id === 'rebar') {
              return (
                productName.includes('میلگرد') ||
                productName.includes('آرماتور')
              );
            }

            // برای نبشی
            if (category.id === 'angle') {
              return productName.includes('نبشی');
            }

            // برای تیرآهن
            if (category.id === 'beam') {
              return productName.includes('تیر');
            }

            // برای لوله
            if (category.id === 'pipe') {
              return productName.includes('لوله');
            }

            // برای سایر دسته‌ها
            return productName.includes(categoryName);
          }
        );

        setSheetsProducts(categoryProducts);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('خطا در دریافت اطلاعات محصولات');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // تبدیل SheetsProduct به Product format
  const products: Product[] = useMemo(() => {
    return sheetsProducts.map((product) => ({
      id: product.id,
      name: product.name,
      size: product.size,
      price: parseInt(product.price) || 0,
      inStock: product.inStock,
      unit: (product.unit as 'kg' | 'ton' | 'piece') || 'piece',
      description: product.description || '',
      brand: product.brand || 'سایر',
      category: category,
      subcategory: product.subcategory || 'عمومی',
      lastUpdated: new Date().toISOString(),
    }));
  }, [sheetsProducts, category]);

  // فیلتر کردن محصولات بر اساس subcategory انتخاب شده
  const filteredProducts = useMemo(() => {
    if (selectedSubcategory === 'all') {
      return products;
    }
    return products.filter(
      (product) => product.subcategory === selectedSubcategory
    );
  }, [products, selectedSubcategory]);

  // دریافت لیست subcategories موجود در محصولات
  const availableSubcategories = useMemo(() => {
    const subcategories = Array.from(
      new Set(products.map((product) => product.subcategory))
    );
    return subcategories.sort();
  }, [products]);

  // گروه‌بندی محصولات فیلتر شده بر اساس برند
  const productsByBrand = filteredProducts.reduce(
    (acc, product) => {
      const brand = product.brand;
      if (!acc[brand]) {
        acc[brand] = [];
      }
      acc[brand].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  // مرتب کردن برندها بر اساس الفبا
  const sortedBrands = Object.keys(productsByBrand).sort();

  // تابع برای مدیریت سفارش محصول
  const handleOrder = (product: Product) => {
    // TODO: پیاده‌سازی منطق سفارش
    console.log('سفارش محصول:', product.name);
  };

  // تابع برای محاسبه وزن
  const handleCalculate = (product: Product) => {
    // TODO: پیاده‌سازی منطق محاسبه
    console.log('محاسبه وزن برای:', product.name);
  };

  if (loading) {
    return (
      <>
        {/* Filter Bar - Loading State */}
        <div className="p-3 mb-6 dark:border-slate-700">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              در حال بارگذاری...
            </h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Filter Bar - Error State */}
        <div className="p-3 mb-6 dark:border-slate-700">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
              خطا در بارگذاری
            </h3>
          </div>
          <div className="py-8 text-center">
            <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="p-3 mb-6 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            فیلتر بر اساس نوع:
          </h3>
        </div>

        {/* فیلتر نوع محصول */}
        {availableSubcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedSubcategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
              }`}
            >
              همه ({products.length})
            </button>
            {availableSubcategories.map((subcategory) => {
              const count = products.filter(
                (p) => p.subcategory === subcategory
              ).length;
              return (
                <button
                  key={subcategory}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSubcategory === subcategory
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {subcategory} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div>
        {filteredProducts.length > 0 ? (
          <div className="space-y-12">
            {sortedBrands.map((brand) => (
              <div key={brand} className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      {brand.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        برند {brand}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {productsByBrand[brand].length} محصول موجود
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <CategoryTable
                    category={category}
                    products={productsByBrand[brand]}
                    onOrder={handleOrder}
                    onCalculate={handleCalculate}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="text-4xl text-slate-400">{category.icon}</div>
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-slate-700 dark:text-slate-300">
              محصولی یافت نشد
            </h3>
            <p className="max-w-md mx-auto text-slate-500 dark:text-slate-400">
              {selectedSubcategory === 'all'
                ? `در حال حاضر محصولی در دسته‌بندی ${category.name} در Google Sheets موجود نیست.`
                : `محصولی از نوع "${selectedSubcategory}" در دسته‌بندی ${category.name} یافت نشد.`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
