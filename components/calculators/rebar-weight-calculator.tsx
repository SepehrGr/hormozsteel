'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

interface RebarWeightCalculatorProps {
  productPrice?: number;
  productUnit?: 'kg' | 'ton' | 'piece';
  includeVAT?: boolean;
  formatPrice?: (price: number) => string;
}

export default function RebarWeightCalculator({
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice = (price: number) => price.toLocaleString('fa-IR'),
}: RebarWeightCalculatorProps) {
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [density, setDensity] = useState('8');
  const [result, setResult] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const calculateWeight = () => {
    const d = parseFloat(diameter);
    const l = parseFloat(length);
    const dens = parseFloat(density);

    if (d && l && dens) {
      // فرمول محاسبه وزن میلگرد: (قطر^2 × π × طول × چگالی) / 1000
      const weight = (d * d * Math.PI * l * dens) / 1000;
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
    setDiameter('');
    setLength('');
    setResult(null);
    setTotalPrice(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن میلگرد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="diameter">قطر (میلیمتر)</Label>
            <Input
              id="diameter"
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="مثال: 14"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="length">طول شاخه (متر)</Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="مثال: 12"
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
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={calculateWeight}
            variant="outline"
            className="flex-1"
          >
            محاسبه وزن دقیق میلگرد
          </Button>
          <Button onClick={resetForm} variant="outline">
            پاک کردن
          </Button>
        </div>

        {result !== null && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/40 dark:border-green-700">
            <div className="text-center">
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-2xl font-bold text-green-600">
                    {result.toLocaleString('fa-IR')} کیلوگرم
                  </div>
                  <div className="text-sm text-green-700">وزن دقیق میلگرد</div>
                </div>
                {totalPrice !== null && productPrice && (
                  <div>
                    <div className="mb-1 text-2xl font-bold text-blue-600">
                      {formatPrice(totalPrice)} تومان
                    </div>
                    <div className="text-sm text-blue-700">
                      قیمت تقریبی ({productPrice.toLocaleString('fa-IR')} تومان/
                      {productUnit === 'kg' ? 'کیلو' : 'تن'})
                      {includeVAT && (
                        <span className="text-green-600"> + ارزش افزوده</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                قطر: {diameter}mm × طول: {length}m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                وزن هر متر:{' '}
                {diameter && length
                  ? (
                      (parseFloat(diameter) ** 2 *
                        Math.PI *
                        parseFloat(density)) /
                      1000
                    ).toFixed(3)
                  : '---'}{' '}
                کیلوگرم
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن میلگرد:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            وزن = (قطر² × π × طول × چگالی) ÷ 1000
          </code>
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            * این فرمول برای میلگرد آجدار و ساده یکسان است
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
