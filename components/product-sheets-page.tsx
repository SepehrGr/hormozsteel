'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product, PriceFilter, PRODUCT_CATEGORIES } from '@/types/products';
import CategoryTable from '@/components/category-table';
import AdvancedFilters from '@/components/advanced-filters';
import WeightCalculatorModal from '@/components/weight-calculator-modal';
import OrderRequestModal from '@/components/order-request-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@heroui/switch';
import {
  Phone,
  Calculator,
  TrendingUp,
  Package,
  Star,
  Filter,
  Search,
  Download,
  Bell,
  CheckCircle,
  Clock,
  Truck,
  Shield,
  Award,
  Users,
  MapPin,
  AlertCircle,
  Info,
  Zap,
  Target,
} from 'lucide-react';

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

interface ProductSheetsPageProps {
  category: string;
  subcategory: string;
  title: string;
  description?: string;
  features?: string[];
  applications?: string[];
  specifications?: { [key: string]: string };
  productId: string;
}

export default function ProductSheetsPage({
  category,
  subcategory,
  title,
  description,
  features = [],
  applications = [],
  specifications = {},
  productId,
}: ProductSheetsPageProps) {
  const [products, setProducts] = useState<SheetsProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PriceFilter>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrderProduct, setSelectedOrderProduct] =
    useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [includeVAT, setIncludeVAT] = useState(false);

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
        // فیلتر کردن محصولات مربوط به این دسته‌بندی و زیردسته
        // همانند ProductPage، فقط محصولات با subcategory مطابق نمایش داده شوند
        const filteredProducts = result.data.filter(
          (product: SheetsProduct) => {
            // ابتدا بررسی کنیم که subcategory محصول دقیقاً برابر باشد
            if (product.subcategory && product.subcategory === subcategory) {
              return true;
            }

            // اگر subcategory دقیق نبود، بر اساس نام محصول فیلتر کنیم
            const productName = product.name.toLowerCase();
            const subcategoryLower = subcategory.toLowerCase();

            // تابع کمکی برای میلگرد
            const isRebarMatch = (keywords: string[]) => {
              return (
                productName.includes('میلگرد') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // تابع کمکی برای پروفیل
            const isProfileMatch = (keywords: string[]) => {
              return (
                productName.includes('پروفیل') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // تابع کمکی برای ورق
            const isSheetMatch = (keywords: string[]) => {
              return (
                productName.includes('ورق') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // تابع کمکی برای لوله
            const isPipeMatch = (keywords: string[]) => {
              return (
                productName.includes('لوله') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // تابع کمکی برای سیم
            const isWireMatch = (keywords: string[]) => {
              return (
                productName.includes('سیم') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // تابع کمکی برای توری
            const isMeshMatch = (keywords: string[]) => {
              return (
                productName.includes('توری') &&
                keywords.some((keyword) => productName.includes(keyword))
              );
            };

            // فیلترهای خاص برای هر دسته و زیردسته
            switch (subcategoryLower) {
              // میلگرد
              case 'ساده':
                return isRebarMatch(['ساده', 'a2']);
              case 'آجدار':
                return isRebarMatch(['آجدار', 'a3']);
              case 'کلاف':
                return isRebarMatch(['کلاف', 'coil']);
              case 'حرارتی':
                return isRebarMatch(['حرارتی', 'thermal']);
              case 'بستر':
                return isRebarMatch(['بستر', 'bastar']);
              case 'ترانس':
                return isRebarMatch(['ترانس', 'trans']);

              // میلگرد استیل (اضافه شده)
              // case 'استیل': already handled above for multiple categories

              // پروفیل
              case 'ساختمانی':
                return isProfileMatch(['ساختمانی', 'building']);
              case 'کنگره':
                return isProfileMatch(['کنگره', 'congress']);
              case 'صنعتی':
                return isProfileMatch(['صنعتی', 'industrial']);
              case 'z':
                return isProfileMatch(['z']);
              case 'گالوانیزه':
                return (
                  (productName.includes('پروفیل') ||
                    productName.includes('ورق') ||
                    productName.includes('لوله') ||
                    productName.includes('سیم') ||
                    productName.includes('توری') ||
                    productName.includes('نبشی')) &&
                  productName.includes('گالوانیزه')
                );
              case 'سبک':
                return (
                  (productName.includes('پروفیل') &&
                    isProfileMatch(['سبک', 'light'])) ||
                  (productName.includes('تیرآهن') &&
                    productName.includes('سبک'))
                );
              case 'استیل':
                return (
                  (productName.includes('پروفیل') ||
                    productName.includes('ورق') ||
                    productName.includes('لوله') ||
                    productName.includes('میلگرد')) &&
                  (productName.includes('استیل') ||
                    productName.includes('steel') ||
                    productName.includes('stainless'))
                );
              case 'آلومینیوم':
                return (
                  (productName.includes('پروفیل') ||
                    productName.includes('ورق') ||
                    productName.includes('لوله')) &&
                  (productName.includes('آلومینیوم') ||
                    productName.includes('aluminum'))
                );
              case 'upe':
                return isProfileMatch(['upe', 'u']);
              case 'ipe':
                return isProfileMatch(['ipe', 'i']);
              case 'hea':
                return isProfileMatch(['hea', 'h']);
              case 'heb':
                return isProfileMatch(['heb', 'h']);

              // ورق
              case 'گرم':
                return isSheetMatch(['گرم', 'hot']);
              case 'سیاه':
                return isSheetMatch(['سیاه', 'black']);
              case 'سرد':
                return isSheetMatch(['سرد', 'cold']);
              case 'رنگی':
                return isSheetMatch(['رنگی', 'color', 'painted']);
              case 'مس':
                return (
                  (productName.includes('ورق') ||
                    productName.includes('لوله')) &&
                  (productName.includes('مس') || productName.includes('copper'))
                );

              // نبشی و ناودانی
              case 'نبشی':
                return (
                  productName.includes('نبشی') || productName.includes('angle')
                );
              case 'ناودانی':
                return (
                  productName.includes('ناودانی') ||
                  productName.includes('channel')
                );
              case 'سپری':
                return (
                  productName.includes('سپری') || productName.includes('separi')
                );

              // تیرآهن
              case 'تیرآهن':
                return (
                  productName.includes('تیرآهن') ||
                  productName.includes('تیر آهن')
                );
              case 'هاش':
                return (
                  productName.includes('هاش') || productName.includes('hash')
                );
              case 'لانه زنبوری':
                return (
                  productName.includes('لانه زنبوری') ||
                  productName.includes('honeycomb')
                );
              case 'ریل':
                return (
                  productName.includes('ریل') || productName.includes('rail')
                );
              case 'سنگین':
                return (
                  productName.includes('تیرآهن') &&
                  productName.includes('سنگین')
                );

              // لوله
              case 'درزدار':
                return isPipeMatch(['درزدار', 'welded']);
              case 'بدون درز':
                return isPipeMatch(['بدون درز', 'seamless']);
              case 'پلی‌اتیلن':
                return isPipeMatch(['پلی‌اتیلن', 'polyethylene', 'pe']);
              case 'pvc':
                return isPipeMatch(['pvc']);

              // سیم
              case 'سیم سیاه':
                return isWireMatch(['سیاه', 'black']);
              case 'سیم گالوانیزه':
                return isWireMatch(['گالوانیزه', 'galvanized']);
              case 'سیم خاردار':
                return isWireMatch(['خاردار', 'barbed']);
              case 'کابل':
                return (
                  productName.includes('کابل') || productName.includes('cable')
                );

              // توری
              case 'توری حصاری':
                return isMeshMatch(['حصاری', 'fence']);
              case 'توری جوشی':
                return isMeshMatch(['جوشی', 'welded']);
              case 'توری پلاستیکی':
                return isMeshMatch(['پلاستیکی', 'plastic']);

              // شمش
              case 'فولاد':
                return (
                  productName.includes('شمش') &&
                  productName.includes('فولاد') &&
                  !productName.includes('آلیاژ') // مطمئن شویم که آلیاژی نباشد
                );
              case 'آلیاژی':
                return (
                  productName.includes('شمش') &&
                  (productName.includes('آلیاژی') ||
                    productName.includes('آلیاژ'))
                );

              // قوطی
              case 'صنعتی':
                return (
                  productName.includes('قوطی') && productName.includes('صنعتی')
                );
              case 'ستونی':
                return (
                  productName.includes('قوطی') && productName.includes('ستونی')
                );

              // محصولات مفتولی
              case 'سیم مفتولی سیاه':
                return (
                  productName.includes('مفتولی') && productName.includes('سیاه')
                );
              case 'سیم مفتولی گالوانیزه':
                return (
                  productName.includes('مفتولی') &&
                  productName.includes('گالوانیزه')
                );
              case 'مش آجدار':
                return (
                  productName.includes('مش') && productName.includes('آجدار')
                );

              // مواد اولیه
              case 'آهن اسفنجی':
                return (
                  productName.includes('آهن اسفنجی') ||
                  productName.includes('sponge iron')
                );
              case 'فروآلیاژ':
                return (
                  productName.includes('فروآلیاژ') ||
                  productName.includes('ferroalloy')
                );

              default:
                // برای سایر موارد، بررسی کلی
                return productName.includes(subcategoryLower);
            }
          }
        );

        setProducts(filteredProducts);
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

  // محاسبه قیمت با/بدون مالیات
  const calculatePrice = (basePrice: number) => {
    return includeVAT ? basePrice * 1.1 : basePrice;
  };

  // فرمت کردن قیمت
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(
      Math.round(calculatePrice(price))
    );
  };

  // پیدا کردن category object
  const categoryInfo = PRODUCT_CATEGORIES.find((cat) => cat.id === category);

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, string> = {
      rebar: 'icon-rebar',
      profile: 'icon-profil',
      sheet: 'icon-varagh',
      angle: 'icon-nabshi',
      beam: 'icon-tirahan',
      pipe: 'icon-lole',
      wire: 'icon-wire',
      mesh: 'icon-Wire-products',
      shamsh: 'icon-bullion',
      qooti: 'icon-Equipment',
      maftoli: 'icon-wire',
      'raw-materials': 'icon-stainless-steel',
    };
    return iconMap[categoryId] || 'icon-rebar';
  };

  // تبدیل SheetsProduct به Product format
  const convertedProducts: Product[] = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      size: product.size,
      price: parseInt(product.price) || 0,
      inStock: product.inStock,
      unit: (product.unit as 'kg' | 'ton' | 'piece') || 'piece',
      description: product.description,
      brand: product.brand || 'سایر',
      category: categoryInfo || PRODUCT_CATEGORIES[0],
      subcategory: product.subcategory || subcategory,
      lastUpdated: new Date().toISOString(),
    }));
  }, [products, categoryInfo, subcategory]);

  // فیلتر کردن محصولات
  const filteredProducts = useMemo(() => {
    let filtered = convertedProducts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (product) => product.category.id === filters.category
      );
    }

    // Subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.subcategory === filters.subcategory
      );
    }

    // Brand filter
    if (filters.brand) {
      if (Array.isArray(filters.brand)) {
        filtered = filtered.filter((product) =>
          filters.brand!.includes(product.brand)
        );
      } else {
        filtered = filtered.filter(
          (product) => product.brand === filters.brand
        );
      }
    }

    // Size filter
    if (filters.size) {
      if (Array.isArray(filters.size)) {
        filtered = filtered.filter((product) =>
          filters.size!.includes(product.size)
        );
      } else {
        filtered = filtered.filter((product) => product.size === filters.size);
      }
    }

    // Price filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price <= filters.maxPrice!
      );
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock);
    }

    return filtered;
  }, [convertedProducts, searchTerm, filters]);

  // گروه‌بندی محصولات بر اساس برند
  const productsByBrand = useMemo(() => {
    const grouped: { [brand: string]: Product[] } = {};
    filteredProducts.forEach((product) => {
      if (!grouped[product.brand]) grouped[product.brand] = [];
      grouped[product.brand].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const handleOrder = (product: Product) => {
    setSelectedOrderProduct(product);
    setIsOrderModalOpen(true);
  };

  const handleCalculate = (product: Product) => {
    setSelectedProduct(product);
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="w-full">
        {/* Header Section */}
        <div className="relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5"></div>
          <div className="relative px-6 py-16 mx-auto max-w-7xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30">
                <i
                  className={
                    getCategoryIcon(category) +
                    ' text-5xl text-white drop-shadow-lg'
                  }
                ></i>
              </div>
              <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-2xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="hidden bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700 lg:block">
          <div className="px-6 py-12 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    کیفیت تضمینی
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    تمام محصولات دارای گواهینامه استاندارد
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    ضمانت اصالت
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ۱۰۰٪ اصل و مستقیم از کارخانه
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    تحویل سریع
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ارسال در کمترین زمان ممکن
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Section */}
        <div className="bg-gray-50 dark:bg-slate-900">
          <div className="px-6 py-20 mx-auto text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              در حال بارگذاری محصولات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {/* Header Section */}
        <div className="relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5"></div>
          <div className="relative px-6 py-16 mx-auto max-w-7xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30">
                <i
                  className={
                    getCategoryIcon(category) +
                    ' text-5xl text-white drop-shadow-lg'
                  }
                ></i>
              </div>
              <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-2xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Section */}
        <div className="bg-gray-50 dark:bg-slate-900">
          <div className="px-6 py-20 mx-auto text-center">
            <div className="mb-4 text-lg text-red-600 dark:text-red-400">
              خطا در بارگذاری محصولات: {error}
            </div>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5"></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30">
              <i
                className={
                  getCategoryIcon(category) +
                  ' text-5xl text-white drop-shadow-lg'
                }
              ></i>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-2xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-3xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="hidden bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700 lg:block">
        <div className="px-6 py-12 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  کیفیت تضمینی
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  تمام محصولات دارای گواهینامه استاندارد
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  ضمانت اصالت
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ۱۰۰٪ اصل و مستقیم از کارخانه
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  تحویل سریع
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ارسال در کمترین زمان ممکن
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky z-10 bg-white border-b top-20 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 right-3 top-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در محصولات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-4 pr-10 border rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-colors text-sm font-medium cursor-pointer ${
                  showFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                    : 'bg-white border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>فیلترها</span>
              </button>
              <div
                className="flex items-center gap-2 px-3 py-2 transition-colors bg-white border rounded-lg cursor-pointer dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIncludeVAT(!includeVAT)}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Switch
                    isSelected={includeVAT}
                    onValueChange={setIncludeVAT}
                    size="sm"
                    color="primary"
                    className="rotate-180"
                    classNames={{
                      wrapper: 'group-data-[selected=true]:bg-blue-500',
                    }}
                  />
                  <span>احتساب ارزش افزوده</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-50 dark:bg-slate-900">
        <div className="px-6 py-6 mx-auto">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {showFilters && (
              <div className="lg:col-span-1">
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={() => setFilters({})}
                  showCategoryFilter={false}
                  currentCategory={category}
                  currentSubcategory={subcategory}
                />
              </div>
            )}

            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="mb-2 text-lg font-semibold text-slate-600 dark:text-slate-400">
                      محصولی یافت نشد
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      لطفاً فیلترهای جستجو را تغییر دهید
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-10">
                  {Object.entries(productsByBrand).map(([brand, products]) => {
                    // فرض بر این است که همه محصولات یک برند در این گروه، دسته و زیردسته یکسان دارند
                    const firstProduct = products[0];
                    const categoryLabel = firstProduct?.category?.name || '';
                    const subcategoryLabel = firstProduct?.subcategory || '';
                    return (
                      <div key={brand}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            {categoryLabel} {subcategoryLabel} {brand}
                          </span>
                          <Badge variant="success">
                            {products.length} محصول
                          </Badge>
                        </div>
                        <CategoryTable
                          category={categoryInfo!}
                          products={products}
                          onOrder={handleOrder}
                          onCalculate={handleCalculate}
                          formatPrice={formatPrice}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="bg-white dark:bg-slate-800">
        <div className="px-6 py-12 mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* ویژگی‌ها */}
            {features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    ویژگی‌های کلیدی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* کاربردها */}
            {applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    کاربردها
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {applications.map((application, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{application}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* مشخصات فنی */}
            {Object.keys(specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-600" />
                    مشخصات فنی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <WeightCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={handleCloseCalculator}
        productName={selectedProduct?.name}
        productCategory={selectedProduct?.category?.name || category}
        productPrice={selectedProduct?.price}
        productUnit={selectedProduct?.unit}
        includeVAT={includeVAT}
        formatPrice={formatPrice}
      />

      <OrderRequestModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrderProduct(null);
        }}
        productName={selectedOrderProduct?.name}
        productSpecs={
          selectedOrderProduct
            ? `${selectedOrderProduct.name} - ${selectedOrderProduct.size} - ${selectedOrderProduct.brand}`
            : ''
        }
      />
    </div>
  );
}
