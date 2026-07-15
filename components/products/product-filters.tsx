'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search } from 'lucide-react';
import { PriceFilter, PRODUCT_CATEGORIES, BRANDS } from '@/types/products';

interface ProductFiltersProps {
  filters: PriceFilter;
  onFiltersChange: (filters: PriceFilter) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof PriceFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && value !== false
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            فیلتر محصولات
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'بستن' : 'باز کردن'}
          </Button>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                دسته:{' '}
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
            {filters.brand && (
              <Badge variant="secondary" className="flex items-center gap-1">
                برند: {filters.brand}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('brand', undefined)}
                />
              </Badge>
            )}
            {filters.size && (
              <Badge variant="secondary" className="flex items-center gap-1">
                سایز: {filters.size}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange('size', undefined)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-500 hover:text-red-700"
            >
              پاک کردن همه
            </Button>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* جستجو */}
          <div>
            <Label htmlFor="search">جستجو در محصولات</Label>
            <div className="relative">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 right-3 top-1/2 text-slate-400" />
              <Input
                id="search"
                placeholder="نام محصول، برند یا سایز..."
                className="pr-10"
              />
            </div>
          </div>

          {/* دسته‌بندی */}
          <div>
            <Label>دسته‌بندی</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
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
                      filters.category === category.id ? undefined : category.id
                    )
                  }
                  className="justify-start"
                >
                  <span className="ml-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* برند */}
          <div>
            <Label>برند</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 overflow-y-auto max-h-32">
              {BRANDS.map((brand) => (
                <Button
                  key={brand}
                  variant={filters.brand === brand ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleFilterChange(
                      'brand',
                      filters.brand === brand ? undefined : brand
                    )
                  }
                  className="justify-start text-xs"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>

          {/* محدوده قیمت */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice">حداقل قیمت (تومان)</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">حداکثر قیمت (تومان)</Label>
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
              />
            </div>
          </div>

          {/* موجودی */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock || false}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="inStock">فقط محصولات موجود</Label>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
