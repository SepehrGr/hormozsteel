'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RefreshCw } from 'lucide-react';
import {
  PriceFilter,
  PRODUCT_CATEGORIES,
  BRANDS,
  REBAR_SIZES,
  BEAM_SIZES,
} from '@/types/products';

interface AdvancedFiltersProps {
  filters: PriceFilter;
  onFiltersChange: (filters: PriceFilter) => void;
  onClearFilters: () => void;
  showCategoryFilter?: boolean;
  currentCategory?: string;
  currentSubcategory?: string;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  showCategoryFilter = true,
  currentCategory,
  currentSubcategory,
}: AdvancedFiltersProps) {
  const handleFilterChange = (key: keyof PriceFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // تابع کمکی برای مدیریت فیلترهای چندگانه
  const handleMultiSelectFilter = (key: keyof PriceFilter, value: string) => {
    const currentValue = filters[key];
    let newValue: string | string[] | undefined;

    if (Array.isArray(currentValue)) {
      if (currentValue.includes(value)) {
        // حذف مقدار از آرایه
        newValue = currentValue.filter((item) => item !== value);
        if (newValue.length === 0) newValue = undefined;
      } else {
        // اضافه کردن مقدار به آرایه
        newValue = [...currentValue, value];
      }
    } else if (currentValue === value) {
      // اگر مقدار فعلی همان مقدار است، آن را حذف کن
      newValue = undefined;
    } else if (currentValue) {
      // اگر مقدار فعلی متفاوت است، آرایه‌ای از هر دو بساز
      newValue = [currentValue as string, value];
    } else {
      // اگر هیچ مقداری نیست، این مقدار را تنظیم کن
      newValue = value;
    }

    handleFilterChange(key, newValue);
  };

  // تابع کمکی برای بررسی فعال بودن فیلتر
  const isFilterActive = (key: keyof PriceFilter, value: string): boolean => {
    const currentValue = filters[key];
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value);
    }
    return currentValue === value;
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && value !== false
  );

  const getAvailableSizes = () => {
    if (filters.category === 'rebar') {
      return REBAR_SIZES;
    } else if (filters.category === 'beam') {
      return BEAM_SIZES;
    }
    return ['8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32'];
  };

  const getSpecializedFilters = () => {
    const category = currentCategory || filters.category;

    switch (category) {
      case 'rebar':
        return (
          <>
            {/* درجه کیفیت میلگرد */}
            {/* <div>
              <Label className="block mb-3 text-sm font-semibold">
                درجه کیفیت
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['A2', 'A3', 'S240', 'S400', 'S500'].map((grade) => (
                  <Button
                    key={grade}
                    variant={
                      isFilterActive('grade', grade) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('grade', grade)}
                    className="text-sm"
                  >
                    {grade}
                  </Button>
                ))}
              </div>
            </div> */}

            {/* طول میلگرد */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                طول (متر)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {['6', '12', '18'].map((length) => (
                  <Button
                    key={length}
                    variant={
                      isFilterActive('length', length) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('length', length)}
                    className="text-sm"
                  >
                    {length}m
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'angle': // نبشی و ناودانی
        return (
          <>
            {/* نوع نبشی/ناودانی */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">نوع</Label>
              <div className="grid grid-cols-1 gap-2">
                {['نبشی', 'ناودانی', 'سپری'].map((type) => (
                  <Button
                    key={type}
                    variant={
                      isFilterActive('subtype', type) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('subtype', type)}
                    className="justify-start text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* ضخامت نبشی */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                ضخامت (میلی‌متر)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {['2', '2.5', '3', '4', '5', '6', '7', '8', '10'].map(
                  (thickness) => (
                    <Button
                      key={thickness}
                      variant={
                        isFilterActive('thickness', thickness)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleMultiSelectFilter('thickness', thickness)
                      }
                      className="text-xs"
                    >
                      {thickness}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* طول شاخه */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                طول شاخه (متر)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['6', '12'].map((length) => (
                  <Button
                    key={length}
                    variant={
                      isFilterActive('length', length) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('length', length)}
                    className="text-sm"
                  >
                    {length}m
                  </Button>
                ))}
              </div>
            </div>

            {/* نوع وزن */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع وزن
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {['استاندارد', 'هم وزن اروپا'].map((weight) => (
                  <Button
                    key={weight}
                    variant={
                      isFilterActive('weightType', weight)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('weightType', weight)
                    }
                    className="justify-start text-sm"
                  >
                    {weight}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'sheet':
        return (
          <>
            {/* نوع ورق */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع ورق
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'سیاه (ST37)',
                  'آجدار',
                  'ST52',
                  'A516',
                  'A283',
                  'گالوانیزه',
                  'رنگی',
                  'روغنی',
                ].map((type) => (
                  <Button
                    key={type}
                    variant={
                      isFilterActive('sheetType', type) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('sheetType', type)}
                    className="justify-start text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* ضخامت ورق */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                ضخامت (میلی‌متر)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  '0.5',
                  '0.7',
                  '1',
                  '1.5',
                  '2',
                  '2.5',
                  '3',
                  '4',
                  '5',
                  '6',
                  '8',
                  '10',
                  '12',
                ].map((thickness) => (
                  <Button
                    key={thickness}
                    variant={
                      isFilterActive('thickness', thickness)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('thickness', thickness)
                    }
                    className="text-xs"
                  >
                    {thickness}
                  </Button>
                ))}
              </div>
            </div>

            {/* درجه کیفیت */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                درجه کیفیت
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['ST37', 'ST52', 'A516', 'A283'].map((grade) => (
                  <Button
                    key={grade}
                    variant={
                      isFilterActive('grade', grade) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('grade', grade)}
                    className="text-sm"
                  >
                    {grade}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'pipe':
        return (
          <>
            {/* نوع لوله */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع لوله
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'داربستی',
                  'مانیسمان (رده 40-80)',
                  'گازی (روکار-توکار)',
                  'جدار چاه',
                  'اسپیرال',
                ].map((type) => (
                  <Button
                    key={type}
                    variant={
                      isFilterActive('pipeType', type) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('pipeType', type)}
                    className="justify-start text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* قطر لوله */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                قطر (اینچ)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  '1/2',
                  '3/4',
                  '1',
                  '1 1/4',
                  '1 1/2',
                  '2',
                  '2 1/2',
                  '3',
                  '4',
                  '5',
                  '6',
                  '8',
                ].map((diameter) => (
                  <Button
                    key={diameter}
                    variant={
                      isFilterActive('diameter', diameter)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('diameter', diameter)
                    }
                    className="text-xs"
                  >
                    {diameter}
                  </Button>
                ))}
              </div>
            </div>

            {/* رده فشار */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                رده فشار
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {['40', '80', 'ساده'].map((grade) => (
                  <Button
                    key={grade}
                    variant={
                      isFilterActive('grade', grade) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('grade', grade)}
                    className="text-sm"
                  >
                    {grade}
                  </Button>
                ))}
              </div>
            </div>

            {/* جنس */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">جنس</Label>
              <div className="grid grid-cols-2 gap-2">
                {['گالوانیزه', 'سیاه', 'استیل'].map((material) => (
                  <Button
                    key={material}
                    variant={
                      isFilterActive('coating', material)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('coating', material)}
                    className="text-sm"
                  >
                    {material}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'profile':
        return (
          <>
            {/* نوع پروفیل */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع پروفیل
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {['Z (زد)', 'درب و پنجره', 'ساختمانی', 'کنگره', 'صنعتی'].map(
                  (type) => (
                    <Button
                      key={type}
                      variant={
                        isFilterActive('subtype', type) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleMultiSelectFilter('subtype', type)}
                      className="justify-start text-sm"
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* استاندارد پروفیل */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                استاندارد
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['IPE', 'UPE', 'HEA', 'HEB'].map((standard) => (
                  <Button
                    key={standard}
                    variant={
                      isFilterActive('standard', standard)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('standard', standard)
                    }
                    className="text-sm"
                  >
                    {standard}
                  </Button>
                ))}
              </div>
            </div>

            {/* جنس */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">جنس</Label>
              <div className="grid grid-cols-2 gap-2">
                {['گالوانیزه', 'سبک', 'استیل', 'آلومینیوم'].map((material) => (
                  <Button
                    key={material}
                    variant={
                      isFilterActive('coating', material)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('coating', material)}
                    className="text-sm"
                  >
                    {material}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'qooti': // قوطی
        return (
          <>
            {/* نوع قوطی */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع قوطی
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {['صنعتی', 'ستونی'].map((type) => (
                  <Button
                    key={type}
                    variant={
                      isFilterActive('subtype', type) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('subtype', type)}
                    className="justify-start text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* ابعاد */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                ابعاد (میلی‌متر)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  '20×20',
                  '25×25',
                  '30×30',
                  '40×40',
                  '50×50',
                  '60×60',
                  '80×80',
                  '100×100',
                ].map((size) => (
                  <Button
                    key={size}
                    variant={
                      isFilterActive('size', size) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('size', size)}
                    className="text-xs"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* ضخامت */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                ضخامت (میلی‌متر)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {['1.5', '2', '2.5', '3', '4', '5', '6'].map((thickness) => (
                  <Button
                    key={thickness}
                    variant={
                      isFilterActive('thickness', thickness)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('thickness', thickness)
                    }
                    className="text-xs"
                  >
                    {thickness}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'beam': // تیرآهن
        return (
          <>
            {/* نوع تیرآهن */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع تیرآهن
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {['تیرآهن', 'هاش', 'لانه زنبوری', 'ریل', 'سنگین', 'سبک'].map(
                  (type) => (
                    <Button
                      key={type}
                      variant={
                        isFilterActive('subtype', type) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleMultiSelectFilter('subtype', type)}
                      className="justify-start text-sm"
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* استاندارد */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                استاندارد
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['IPE', 'UPE', 'HEA', 'HEB'].map((standard) => (
                  <Button
                    key={standard}
                    variant={
                      isFilterActive('standard', standard)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('standard', standard)
                    }
                    className="text-sm"
                  >
                    {standard}
                  </Button>
                ))}
              </div>
            </div>

            {/* ارتفاع */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                ارتفاع (میلی‌متر)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  '80',
                  '100',
                  '120',
                  '140',
                  '160',
                  '180',
                  '200',
                  '220',
                  '240',
                  '270',
                  '300',
                ].map((height) => (
                  <Button
                    key={height}
                    variant={
                      isFilterActive('height', height) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('height', height)}
                    className="text-xs"
                  >
                    {height}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'wire': // محصولات مفتولی
        return (
          <>
            {/* نوع سیم */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع سیم
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {['سیم سیاه', 'سیم گالوانیزه', 'سیم خاردار', 'کابل'].map(
                  (type) => (
                    <Button
                      key={type}
                      variant={
                        isFilterActive('wireType', type) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleMultiSelectFilter('wireType', type)}
                      className="justify-start text-sm"
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* قطر سیم */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                قطر (میلی‌متر)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '1.5', '2', '2.5', '3', '4', '5', '6'].map(
                  (diameter) => (
                    <Button
                      key={diameter}
                      variant={
                        isFilterActive('diameter', diameter)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleMultiSelectFilter('diameter', diameter)
                      }
                      className="text-xs"
                    >
                      {diameter}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* نوع بسته‌بندی */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                بسته‌بندی
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['کلاف', 'شاخه', 'حلقه'].map((package_type) => (
                  <Button
                    key={package_type}
                    variant={
                      isFilterActive('packageType', package_type)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleMultiSelectFilter('packageType', package_type)
                    }
                    className="text-sm"
                  >
                    {package_type}
                  </Button>
                ))}
              </div>
            </div>
          </>
        );

      case 'mesh': // توری
        return (
          <>
            {/* نوع توری */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                نوع توری
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'توری حصاری',
                  'توری جوشی',
                  'توری گالوانیزه',
                  'توری پلاستیکی',
                  'مش',
                ].map((type) => (
                  <Button
                    key={type}
                    variant={
                      isFilterActive('subtype', type) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleMultiSelectFilter('subtype', type)}
                    className="justify-start text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* سایز چشمه */}
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                سایز چشمه (میلی‌متر)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {['5×5', '10×10', '15×15', '20×20', '25×25', '50×50'].map(
                  (mesh_size) => (
                    <Button
                      key={mesh_size}
                      variant={
                        isFilterActive('meshSize', mesh_size)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleMultiSelectFilter('meshSize', mesh_size)
                      }
                      className="text-xs"
                    >
                      {mesh_size}
                    </Button>
                  )
                )}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sticky space-y-4 top-40">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            فیلترهای پیشرفته
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              پاک کردن همه
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* دسته‌بندی - فقط در صفحه اصلی محصولات نمایش داده شود */}
          {showCategoryFilter && (
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                دسته‌بندی
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCT_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      filters.category === category.id ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleFilterChange(
                        'category',
                        filters.category === category.id
                          ? undefined
                          : category.id
                      )
                    }
                    className="justify-start h-auto py-2"
                  >
                    <span className="ml-2 text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* زیردسته - فقط در صفحه اصلی محصولات یا در صورت انتخاب دسته نمایش داده شود */}
          {showCategoryFilter && filters.category && (
            <div>
              <Label className="block mb-3 text-sm font-semibold">
                زیردسته
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCT_CATEGORIES.find(
                  (c) => c.id === filters.category
                )?.subcategories.map((subcategory) => (
                  <Button
                    key={subcategory}
                    variant={
                      filters.subcategory === subcategory
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleFilterChange(
                        'subcategory',
                        filters.subcategory === subcategory
                          ? undefined
                          : subcategory
                      )
                    }
                    className="justify-start text-sm"
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* برند */}
          <div>
            <Label className="block mb-3 text-sm font-semibold">برند</Label>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-48">
              {BRANDS.map((brand) => (
                <Button
                  key={brand}
                  variant={
                    isFilterActive('brand', brand) ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleMultiSelectFilter('brand', brand)}
                  className="justify-start text-sm"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>

          {/* سایز */}
          <div>
            <Label className="block mb-3 text-sm font-semibold">سایز</Label>
            <div className="grid grid-cols-3 gap-2">
              {getAvailableSizes().map((size) => (
                <Button
                  key={size}
                  variant={isFilterActive('size', size) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMultiSelectFilter('size', size)}
                  className="text-sm"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* فیلترهای تخصصی بر اساس نوع محصول */}
          {getSpecializedFilters()}

          {/* محدوده قیمت */}
          <div>
            <Label className="block mb-3 text-sm font-semibold">
              محدوده قیمت (تومان)
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="minPrice" className="text-xs">
                  حداقل قیمت
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minPrice',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs">
                  حداکثر قیمت
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxPrice',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="1000000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* موجودی */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock || false}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="inStock" className="text-sm">
              فقط محصولات موجود
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* فیلترهای فعال */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">فیلترهای فعال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {
                    PRODUCT_CATEGORIES.find((c) => c.id === filters.category)
                      ?.name
                  }
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('category', undefined)}
                  />
                </Badge>
              )}
              {filters.subcategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.subcategory}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('subcategory', undefined)}
                  />
                </Badge>
              )}
              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.brand}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('brand', undefined)}
                  />
                </Badge>
              )}
              {filters.size && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  سایز {filters.size}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('size', undefined)}
                  />
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  قیمت: {filters.minPrice || 0} - {filters.maxPrice || '∞'}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      handleFilterChange('minPrice', undefined);
                      handleFilterChange('maxPrice', undefined);
                    }}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  فقط موجود
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('inStock', false)}
                  />
                </Badge>
              )}

              {/* فیلترهای تخصصی در نمایش فعال */}
              {filters.grade && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  درجه {filters.grade}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('grade', undefined)}
                  />
                </Badge>
              )}
              {filters.thickness && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ضخامت {filters.thickness}mm
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('thickness', undefined)}
                  />
                </Badge>
              )}
              {filters.diameter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  قطر {filters.diameter}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('diameter', undefined)}
                  />
                </Badge>
              )}
              {filters.coating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.coating}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('coating', undefined)}
                  />
                </Badge>
              )}
              {filters.standard && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.standard}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('standard', undefined)}
                  />
                </Badge>
              )}
              {filters.length && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  طول {filters.length}m
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('length', undefined)}
                  />
                </Badge>
              )}

              {/* فیلترهای جدید در نمایش فعال */}
              {filters.subtype && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.subtype)
                    ? filters.subtype.join(', ')
                    : filters.subtype}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('subtype', undefined)}
                  />
                </Badge>
              )}
              {filters.weightType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.weightType)
                    ? filters.weightType.join(', ')
                    : filters.weightType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('weightType', undefined)}
                  />
                </Badge>
              )}
              {filters.sheetType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.sheetType)
                    ? filters.sheetType.join(', ')
                    : filters.sheetType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('sheetType', undefined)}
                  />
                </Badge>
              )}
              {filters.pipeType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.pipeType)
                    ? filters.pipeType.join(', ')
                    : filters.pipeType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('pipeType', undefined)}
                  />
                </Badge>
              )}
              {filters.wireType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.wireType)
                    ? filters.wireType.join(', ')
                    : filters.wireType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('wireType', undefined)}
                  />
                </Badge>
              )}
              {filters.height && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ارتفاع{' '}
                  {Array.isArray(filters.height)
                    ? filters.height.join(', ')
                    : filters.height}
                  mm
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('height', undefined)}
                  />
                </Badge>
              )}
              {filters.meshSize && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  چشمه{' '}
                  {Array.isArray(filters.meshSize)
                    ? filters.meshSize.join(', ')
                    : filters.meshSize}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('meshSize', undefined)}
                  />
                </Badge>
              )}
              {filters.packageType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {Array.isArray(filters.packageType)
                    ? filters.packageType.join(', ')
                    : filters.packageType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('packageType', undefined)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
