'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

interface SheetWeightCalculatorProps {
  productPrice?: number;
  productUnit?: 'kg' | 'ton' | 'piece';
  includeVAT?: boolean;
  formatPrice?: (price: number) => string;
}

export default function SheetWeightCalculator({
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice = (price: number) => price.toLocaleString('fa-IR'),
}: SheetWeightCalculatorProps) {
  const [sheetType, setSheetType] = useState('سیاه');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [density, setDensity] = useState('8');
  const [result, setResult] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const calculateWeight = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness);
    const d = parseFloat(density);

    if (l && w && t && d) {
      // فرمول محاسبه وزن ورق مطابق سایت آهن ملل:
      // طول ورق (m) × عرض ورق (m) × ضخامت ورق (mm) × چگالی ورق = وزن ورق
      let weight = l * w * t * d;

      // اعمال فرمول‌های مختلف برای انواع ورق مطابق سایت آهن ملل
      switch (sheetType) {
        case 'آجدار':
          // فرمول ورق آجدار: (X + ضخامت) × طول × عرض × چگالی
          if (t <= 3) {
            weight = (0.3 + t) * l * w * d; // X=0.3 برای ضخامت ≤3mm
          } else if (t >= 4) {
            weight = (0.4 + t) * l * w * d; // X=0.4 برای ضخامت ≥4mm
          }
          break;
        case 'هاردوکس':
          // فرمول ورق هاردوکس: (0.3 + ضخامت) × طول × عرض × چگالی
          weight = (0.3 + t) * l * w * d;
          break;
        case 'آلومینیومی':
          // ورق آلومینیومی - چگالی ثابت 2.73 (مطابق سایت مرجع)
          weight = l * w * t * 2.73;
          break;
        default:
          // بقیه ورق‌ها (سیاه، گالوانیزه، رنگی، روغنی، اسیدشویی) - فرمول استاندارد
          weight = l * w * t * d;
      }

      setResult(Math.round(weight * 100) / 100);

      // محاسبه قیمت اگر قیمت محصول موجود باشد
      if (productPrice && weight > 0) {
        let finalPrice = 0;
        if (productUnit === 'kg') {
          finalPrice = weight * productPrice;
        } else if (productUnit === 'ton') {
          finalPrice = (weight / 1000) * productPrice;
        }

        // اضافه کردن ارزش افزوده اگر فعال باشد (10%)
        if (includeVAT) {
          finalPrice = finalPrice * 1.1;
        }

        setTotalPrice(Math.round(finalPrice));
      }
    }
  };

  const resetForm = () => {
    setLength('');
    setWidth('');
    setThickness('');
    setResult(null);
    setTotalPrice(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن ورق
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sheetType">نوع ورق</Label>
            <Select
              selectedKeys={[sheetType]}
              onSelectionChange={(keys) =>
                setSheetType(Array.from(keys)[0] as string)
              }
              placeholder="انتخاب نوع ورق"
              variant="bordered"
              className="mt-1 bg-white dark:bg-neutral-900"
            >
              <SelectItem key="سیاه">ورق سیاه</SelectItem>
              <SelectItem key="گالوانیزه">ورق گالوانیزه</SelectItem>
              <SelectItem key="رنگی">ورق رنگی</SelectItem>
              <SelectItem key="روغنی">ورق روغنی</SelectItem>
              <SelectItem key="اسیدشویی">ورق اسیدشویی</SelectItem>
              <SelectItem key="آلومینیومی">ورق آلومینیومی</SelectItem>
              <SelectItem key="آجدار">ورق آجدار</SelectItem>
              <SelectItem key="هاردوکس">ورق هاردوکس</SelectItem>
            </Select>
          </div>

          <div>
            <Label htmlFor="length">
              طول <span className="text-xs">(متر)</span>
            </Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="مثال: 6"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="width">
              عرض <span className="text-xs">(متر)</span>
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="مثال: 1.5"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="thickness">
              ضخامت <span className="text-xs">(میلی‌متر)</span>
            </Label>
            <Input
              id="thickness"
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="مثال: 3"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="density">انتخاب چگالی</Label>
            <Select
              selectedKeys={[density]}
              onSelectionChange={(keys) =>
                setDensity(Array.from(keys)[0] as string)
              }
              placeholder="انتخاب چگالی"
              variant="bordered"
              className="mt-1 bg-white dark:bg-neutral-900"
            >
              <SelectItem key="8">چگالی رایج (8)</SelectItem>
              <SelectItem key="7.85">چگالی استاندارد (7.85)</SelectItem>
              <SelectItem key="7.86">آهن (7.86)</SelectItem>
              <SelectItem key="7.84">استیل (7.84)</SelectItem>
              <SelectItem key="2.73">آلومینیوم (2.73)</SelectItem>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={calculateWeight}
            variant="outline"
            className="flex-1"
          >
            محاسبه وزن دقیق ورق
          </Button>
          <Button onClick={resetForm} variant="outline">
            پاک کردن
          </Button>
        </div>

        {result !== null && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/40 dark:border-green-700">
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-green-600">
                {result.toLocaleString('fa-IR')} کیلوگرم
              </div>
              <div className="mb-2 text-sm text-green-700">
                محاسبه وزن دقیق ورق
              </div>
              {totalPrice !== null && productPrice && (
                <>
                  <div className="mb-1 text-2xl font-bold text-blue-600">
                    {formatPrice(totalPrice)} تومان
                  </div>
                  <div className="mb-2 text-sm text-blue-700">
                    قیمت تقریبی ({productPrice.toLocaleString('fa-IR')} تومان/
                    {productUnit === 'kg' ? 'کیلو' : 'تن'})
                    {includeVAT && (
                      <span className="text-green-600"> + ارزش افزوده</span>
                    )}
                  </div>
                </>
              )}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                ورق {sheetType}: طول {length}{' '}
                <span className="text-xs">(متر)</span> × عرض {width}{' '}
                <span className="text-xs">(متر)</span> × ضخامت {thickness}{' '}
                <span className="text-xs">(میلی‌متر)</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                چگالی استفاده شده: {density}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن ورق:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            طول ورق (متر) × عرض ورق (متر) × ضخامت ورق (میلی‌متر) × چگالی ورق =
            وزن ورق
          </code>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            <p>
              • ورق آجدار: (X + ضخامت) × طول × عرض × چگالی (X=0.3 برای ≤3mm,
              X=0.4 برای ≥4mm)
            </p>
            <p>• ورق هاردوکس: (0.3 + ضخامت) × طول × عرض × چگالی</p>
            <p>
              • ورق آلومینیومی: طول × عرض × ضخامت × 2.73 (چگالی ثابت آلومینیوم)
            </p>
            <p>• بقیه ورق‌ها: طول × عرض × ضخامت × چگالی</p>
            <p>• چگالی رایج: 8 - چگالی استاندارد: 7.85</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
