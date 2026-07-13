'use client';

import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from '@/components/product-card';
import { SAMPLE_PRODUCTS, Product } from '@/types/products';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

interface ProductSliderProps {
  products?: Product[];
  onOrder?: (product: Product) => void;
  onCalculate?: (product: Product) => void;
  title?: string;
  fetchFromApi?: boolean;
}

export default function ProductSlider({
  products: initialProducts,
  onOrder = () => {},
  onCalculate = () => {},
  title = 'محصولات پیشنهادی',
  fetchFromApi = false,
}: ProductSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [products, setProducts] = useState<Product[]>(
    initialProducts || SAMPLE_PRODUCTS.slice(0, 12)
  );
  const [loading, setLoading] = useState(fetchFromApi);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchFromApi) {
      const fetchLatestPrices = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/latest-prices');
          const data = await response.json();

          if (data.success && data.products) {
            setProducts(data.products);
          } else {
            setError('خطا در دریافت اطلاعات');
            setProducts(SAMPLE_PRODUCTS.slice(0, 12));
          }
        } catch (err) {
          console.error('Error fetching latest prices:', err);
          setError('خطا در دریافت اطلاعات');
          setProducts(SAMPLE_PRODUCTS.slice(0, 12));
        } finally {
          setLoading(false);
        }
      };

      fetchLatestPrices();
    }
  }, [fetchFromApi]);

  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        swiperRef.current.update();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
        <div className="hidden gap-2 md:flex">
          <button className="p-2 transition-colors border rounded-md cursor-pointer swiper-button-prev-products border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-2 transition-colors border rounded-md cursor-pointer swiper-button-next-products border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              در حال دریافت آخرین قیمت‌ها...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            loop={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            navigation={{
              nextEl: '.swiper-button-next-products',
              prevEl: '.swiper-button-prev-products',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-products',
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },

              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1536: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="products-swiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="h-auto">
                <div className="h-full py-6">
                  <ProductCard
                    product={product}
                    onOrder={onOrder}
                    onCalculate={onCalculate}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination for mobile */}
          <div className="text-center swiper-pagination-products md:hidden"></div>

          {/* Mobile navigation */}
          <div className="flex items-center justify-center gap-3 mt-2 md:hidden">
            <button className="p-2 transition-colors border rounded-md cursor-pointer swiper-button-prev-products border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-2 transition-colors border rounded-md cursor-pointer swiper-button-next-products border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
