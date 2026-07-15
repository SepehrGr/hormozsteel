'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

export default function AngleWeightCalculator() {
  const [wing1Length, setWing1Length] = useState('');
  const [wing2Length, setWing2Length] = useState('');
  const [thickness, setThickness] = useState('');
  const [length, setLength] = useState('');
  const [density, setDensity] = useState('8'); // already default, but keep for consistency
  const [result, setResult] = useState<number | null>(null);

  const calculateWeight = () => {
    const w1 = parseFloat(wing1Length);
    const w2 = parseFloat(wing2Length) || w1; // اگر بال دوم خالی باشد، بال مساوی در نظر بگیر
    const t = parseFloat(thickness);
    const l = parseFloat(length);
    const d = parseFloat(density);

    if (w1 && t && l && d) {
      // فرمول محاسبه وزن نبشی مطابق سایت آهن ملل
      let weight;
      if (w2 === w1) {
        // نبشی بال مساوی: چگالی × طول × ضخامت × طول بال × 2 ÷ 1000
        weight = (d * l * t * w1 * 2) / 1000;
      } else {
        // نبشی بال نامساوی: چگالی × طول × ضخامت × مجموع طول بال‌ها ÷ 1000
        weight = (d * l * t * (w1 + w2)) / 1000;
      }
      setResult(Math.round(weight * 100) / 100);
    }
  };

  const resetForm = () => {
    setWing1Length('');
    setWing2Length('');
    setThickness('');
    setLength('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن نبشی فولادی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="wing1Length">طول بال اول (میلیمتر)</Label>
            <Input
              id="wing1Length"
              type="number"
              value={wing1Length}
              onChange={(e) => setWing1Length(e.target.value)}
              placeholder="مثال: 50"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="wing2Length">طول بال دوم (میلیمتر)</Label>
            <Input
              id="wing2Length"
              type="number"
              value={wing2Length}
              onChange={(e) => setWing2Length(e.target.value)}
              placeholder="مثال: 50 (برای نبشی مساوی)"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="thickness">ضخامت (میلیمتر)</Label>
            <Input
              id="thickness"
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="مثال: 5"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="length">طول (متر)</Label>
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
            <Label htmlFor="density">انتخاب چگالی</Label>
            <Select
              selectedKeys={[density]}
              onSelectionChange={(keys) =>
                setDensity(Array.from(keys)[0] as string)
              }
              variant="bordered"
              placeholder="انتخاب چگالی"
              className="mt-1 dark:bg-neutral-900"
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
            محاسبه وزن دقیق نبشی
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
              <div className="text-sm text-green-700">
                وزن دقیق نبشی{' '}
                {wing2Length && wing2Length !== wing1Length
                  ? 'بال نامساوی'
                  : 'بال مساوی'}
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                بال اول: {wing1Length}mm × بال دوم: {wing2Length || wing1Length}
                mm × ضخامت: {thickness}mm
              </div>
              <div className="text-xs text-gray-600">طول شاخه: {length}m</div>
            </div>
          </div>
        )}

        <div className="order-last p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700 md:order-none">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن نبشی:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            نبشی بال مساوی: چگالی × طول × ضخامت × طول بال × 2 ÷ 1000
            <br />
            نبشی بال نامساوی: چگالی × طول × ضخامت × مجموع طول بال‌ها ÷ 1000
          </code>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            <p>• انواع: نبشی بال مساوی، نبشی بال نامساوی، نبشی اسپیرال</p>
            <p>• کاربرد: اتصال پل‌ها، ستون‌ها و خرپا</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
