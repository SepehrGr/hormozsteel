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
  RefreshCw,
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

interface ProductPageProps {
  category: string;
  subcategory: string;
  title: string;
  description?: string;
  features?: string[];
  applications?: string[];
  specifications?: { [key: string]: string };
  productId?: string;
  enableSheetsToggle?: boolean;
}

export default function ProductPage({
  category,
  subcategory,
  title,
  description,
  features = [],
  applications = [],
  specifications = {},
}: ProductPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/api/products?category=${category}&subcategory=${encodeURIComponent(subcategory)}&limit=1000`;
        console.log('🔍 ProductPage: Fetching from URL:', url);
        console.log(
          '🔍 ProductPage: Category:',
          category,
          '| Subcategory:',
          subcategory
        );

        const response = await fetch(url);
        const data = await response.json();

        console.log('✅ ProductPage: API Response:', data);
        console.log(
          '✅ ProductPage: Products count:',
          data.success ? data.data.products.length : 0
        );

        if (data.success) {
          setProducts(data.data.products);
        } else {
          setError(data.error || 'خطا در دریافت محصولات');
        }
      } catch (err) {
        console.error('❌ ProductPage: Error fetching products:', err);
        setError('خطا در دریافت محصولات');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

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

  // فیلتر کردن محصولات بر اساس دسته و زیردسته
  const filteredProducts = useMemo(() => {
    console.log('🔍 ProductPage Filter: Starting filter...');
    console.log('🔍 ProductPage Filter: Total products:', products.length);
    console.log(
      '🔍 ProductPage Filter: Category:',
      category,
      '| Subcategory:',
      subcategory
    );

    const filtered = products.filter((product) => {
      // محصولات از API قبلاً فیلتر شده‌اند، اما برای اطمینان بررسی می‌کنیم
      // Note: product.category از API یک object است با slug
      console.log(
        '🔍 Checking product:',
        product.name,
        '| category.slug:',
        product.category?.slug,
        '| subcategory:',
        product.subcategory
      );

      if (product.category?.slug !== category) {
        console.log(
          '  ❌ Category mismatch:',
          product.category?.slug,
          '!==',
          category
        );
        return false;
      }
      if (product.subcategory !== subcategory) {
        console.log(
          '  ❌ Subcategory mismatch:',
          product.subcategory,
          '!==',
          subcategory
        );
        return false;
      }

      // تابع کمکی برای بررسی فیلترهای چندگانه
      const matchesFilter = (
        filterValue: string | string[] | undefined,
        productValue: string | undefined
      ) => {
        if (!filterValue) return true;
        if (!productValue) return false;
        if (Array.isArray(filterValue)) {
          return filterValue.includes(productValue);
        }
        return filterValue === productValue;
      };

      // فیلترهای اضافی با پشتیبانی از چندین انتخاب
      if (!matchesFilter(filters.brand, product.brand)) return false;
      if (!matchesFilter(filters.size, product.size)) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.inStock && !product.inStock) return false;

      // فیلترهای تخصصی با پشتیبانی از چندین انتخاب
      if (!matchesFilter(filters.thickness, product.thickness)) return false;
      if (!matchesFilter(filters.diameter, product.diameter)) return false;
      if (!matchesFilter(filters.grade, product.grade)) return false;
      if (!matchesFilter(filters.coating, product.coating)) return false;
      if (!matchesFilter(filters.standard, product.standard)) return false;
      if (!matchesFilter(filters.length, product.length)) return false;

      // فیلترهای جدید
      if (!matchesFilter(filters.subtype, product.subtype)) return false;
      if (!matchesFilter(filters.weightType, product.weightType)) return false;
      if (!matchesFilter(filters.sheetType, product.sheetType)) return false;
      if (!matchesFilter(filters.pipeType, product.pipeType)) return false;
      if (!matchesFilter(filters.wireType, product.wireType)) return false;
      if (!matchesFilter(filters.height, product.height)) return false;
      if (!matchesFilter(filters.meshSize, product.meshSize)) return false;
      if (!matchesFilter(filters.packageType, product.packageType))
        return false;

      // جستجوی متنی
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.size.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });

    console.log(
      '✅ ProductPage Filter: Filtered products count:',
      filtered.length
    );
    return filtered;
  }, [products, category, subcategory, filters, searchTerm]);

  const categoryInfo = PRODUCT_CATEGORIES.find((c) => c.id === category);

  // Function to get the appropriate icon for each product category
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
      billet: 'icon-bullion',
      tube: 'icon-Equipment',
      'raw-materials': 'icon-stainless-steel',
    };
    return iconMap[categoryId] || 'icon-rebar';
  };

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

  // گروه‌بندی محصولات بر اساس برند
  const productsByBrand = useMemo(() => {
    const grouped: { [brand: string]: Product[] } = {};
    filteredProducts.forEach((product) => {
      if (!grouped[product.brand]) grouped[product.brand] = [];
      grouped[product.brand].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  return (
    <div className="w-full">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400">
              در حال بارگذاری محصولات...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="py-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full dark:bg-red-900/20">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-slate-700 dark:text-slate-300">
              خطا در دریافت اطلاعات
            </h3>
            <p className="max-w-md mx-auto mb-4 text-slate-500 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {/* Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
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

                <div
                  className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}
                >
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
                      {Object.entries(productsByBrand).map(
                        ([brand, products]) => {
                          // فرض بر این است که همه محصولات یک برند در این گروه، دسته و زیردسته یکسان دارند
                          const firstProduct = products[0];
                          const categoryLabel =
                            firstProduct?.category?.name || '';
                          const subcategoryLabel =
                            firstProduct?.subcategory || '';
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
                        }
                      )}
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
        </>
      )}
    </div>
  );
}
