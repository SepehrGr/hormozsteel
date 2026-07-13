import { notFound } from 'next/navigation';
import UnifiedProductPage from '@/components/unified-product-page';
import { PRODUCT_ROUTES, PRODUCT_CATEGORIES } from '@/types/products';

interface ProductPageProps {
  params: Promise<{
    categorySlug: string;
    productId: string;
  }>;
}

// Generate static params for all products within their categories
export async function generateStaticParams() {
  const params: { categorySlug: string; productId: string }[] = [];

  // برای هر محصول در PRODUCT_ROUTES، یک param تولید کن
  Object.entries(PRODUCT_ROUTES).forEach(([productId, productData]) => {
    params.push({
      categorySlug: productData.category,
      productId: productId,
    });
  });

  return params;
}

// Generate metadata for each product
export async function generateMetadata({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params;

  const productData = PRODUCT_ROUTES[productId as keyof typeof PRODUCT_ROUTES];

  // Validate that product exists and belongs to the category
  if (!productData || productData.category !== categorySlug) {
    return {
      title: 'محصول یافت نشد',
    };
  }

  return {
    title: `${productData.name} | آهن هرمز`,
    description: `اطلاعات کامل قیمت و مشخصات ${productData.name} در آهن هرمز`,
    openGraph: {
      title: `${productData.name} | آهن هرمز`,
      description: `اطلاعات کامل قیمت و مشخصات ${productData.name} در آهن هرمز`,
    },
  };
}

export default async function DynamicProductPage({ params }: ProductPageProps) {
  const { categorySlug, productId } = await params;

  const productData = PRODUCT_ROUTES[productId as keyof typeof PRODUCT_ROUTES];

  // Validate that product exists and belongs to the correct category
  if (!productData || productData.category !== categorySlug) {
    notFound();
  }

  // Product-specific configurations
  const getProductConfig = (productId: string) => {
    const configs: Record<string, any> = {
      'milgerd-sade': {
        features: [
          'سطح صاف و یکنواخت',
          'مقاومت بالا در برابر کشش',
          'قابلیت خمش و شکل‌دهی آسان',
          'قیمت اقتصادی و مقرون به صرفه',
          'تولید مطابق استانداردهای ملی',
          'دسترسی آسان در بازار',
          'کیفیت یکنواخت در تمام سایزها',
          'مناسب برای پروژه‌های مختلف',
        ],
        applications: [
          'آرماتوربندی دال‌های بتنی',
          'ساخت ستون‌های بتن آرمه',
          'تقویت دیوارهای بتنی',
          'ساخت تیرهای بتن آرمه',
          'پروژه‌های مسکونی و تجاری',
          'زیرسازی راه‌ها و پل‌ها',
          'سازه‌های صنعتی سبک',
          'کاربردهای عمومی ساختمان',
        ],
        specifications: {
          'استاندارد تولید': 'ISIRI 6906',
          'حد تسلیم': '300-400 مگاپاسکال',
          'حد کشش': '500-600 مگاپاسکال',
          'سایزهای موجود': '8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32',
          'طول استاندارد': '12 متر',
          'نوع سطح': 'صاف',
          'کاربرد اصلی': 'بتن آرمه',
          'مقاومت در برابر زنگ': 'متوسط',
        },
      },
      'milgerd-ajdar': {
        features: [
          'سطح آجدار برای چسبندگی بهتر',
          'مقاومت کششی فوق‌العاده',
          'باند قوی با بتن',
          'تولید با کیفیت بالا',
          'مطابق استانداردهای بین‌المللی',
          'دوام بالا در محیط‌های مختلف',
          'قابلیت جوشکاری مناسب',
          'عملکرد عالی در سازه‌های مهم',
        ],
        applications: [
          'سازه‌های بتن آرمه مهم',
          'ساختمان‌های بلندمرتبه',
          'پل‌ها و سازه‌های راهی',
          'تونل‌ها و زیرگذرها',
          'سدها و سازه‌های آبی',
          'ساختمان‌های صنعتی سنگین',
          'پایه‌های تجهیزات سنگین',
          'مناطق زلزله‌خیز',
        ],
        specifications: {
          'استاندارد تولید': 'ISIRI 6906',
          'حد تسلیم': '400-500 مگاپاسکال',
          'حد کشش': '600-700 مگاپاسکال',
          'سایزهای موجود': '10, 12, 14, 16, 18, 20, 22, 25, 28, 32',
          'طول استاندارد': '12 متر',
          'نوع سطح': 'آجدار',
          'کاربرد اصلی': 'بتن آرمه پیش‌تنیده',
          'مقاومت در برابر زنگ': 'بالا',
        },
      },
      'shamsh-folad': {
        features: [
          'کیفیت بالا و استاندارد',
          'مناسب برای تولید انواع فولاد',
          'قیمت مناسب و رقابتی',
          'موجود در ابعاد مختلف',
          'خلوص بالای مواد اولیه',
          'قابلیت ذوب مجدد عالی',
        ],
        applications: [
          'تولید ورق فولادی',
          'ساخت قطعات خودرو',
          'صنایع ساختمانی',
          'تولید لوله و پروفیل',
          'صنایع ماشین‌سازی',
          'تولید ابزار فولادی',
        ],
        specifications: {
          'درجه کیفیت': 'A36, A283',
          'ابعاد استاندارد': '100x100mm تا 300x300mm',
          'وزن واحد': '100-500 کیلوگرم',
          پوشش: 'بدون پوشش',
          'درصد کربن': '0.15-0.25%',
          'درصد منگنز': '0.60-0.90%',
        },
      },
      'qooti-sanate': {
        features: [
          'مقاومت بالا در برابر فشار',
          'جوشکاری آسان',
          'ابعاد دقیق و استاندارد',
          'کیفیت مطابق استاندارد ملی',
          'سطح یکنواخت',
          'قابلیت شکل‌دهی مناسب',
        ],
        applications: [
          'ساخت سازه های صنعتی',
          'تیرهای ساختمانی',
          'قاب بندی',
          'ساخت دکل و برج',
          'سازه‌های فلزی سبک',
          'قفسه‌بندی صنعتی',
        ],
        specifications: {
          جنس: 'فولاد St37',
          ابعاد: '20x20mm تا 200x200mm',
          ضخامت: '1.5mm تا 12mm',
          'طول استاندارد': '6 و 12 متر',
          'نوع ساخت': 'نورد سرد',
          'کیفیت سطح': 'صاف',
        },
      },
    };

    return (
      configs[productId] || {
        features: [
          'کیفیت مطابق استانداردهای ملی',
          'قیمت رقابتی',
          'دسترسی آسان',
          'کاربرد در صنایع مختلف',
        ],
        applications: [
          'صنعت ساختمان',
          'صنایع فولادی',
          'پروژه‌های عمرانی',
          'کاربردهای صنعتی',
        ],
        specifications: {
          کیفیت: 'استاندارد',
          تولید: 'داخلی',
          موجودی: 'در انبار',
        },
      }
    );
  };

  const config = getProductConfig(productId);

  return (
    <UnifiedProductPage
      category={productData.category}
      subcategory={productData.subcategory}
      title={productData.name}
      description={`اطلاعات کامل قیمت و مشخصات ${productData.name}`}
      features={config.features}
      applications={config.applications}
      specifications={config.specifications}
      productId={productId}
    />
  );
}
