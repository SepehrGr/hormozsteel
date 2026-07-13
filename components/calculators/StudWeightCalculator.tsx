'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

export default function StudWeightCalculator() {
  const [flangeWidth, setFlangeWidth] = useState('');
  const [flangeThickness, setFlangeThickness] = useState('');
  const [webHeight, setWebHeight] = useState('');
  const [webThickness, setWebThickness] = useState('');
  const [length, setLength] = useState('');
  const [density, setDensity] = useState('8');
  const [result, setResult] = useState<number | null>(null);

  const calculateWeight = () => {
    const fw = parseFloat(flangeWidth);
    const ft = parseFloat(flangeThickness);
    const wh = parseFloat(webHeight);
    const wt = parseFloat(webThickness);
    const l = parseFloat(length);
    const d = parseFloat(density);

    if (fw && ft && wh && wt && l && d) {
      // فرمول محاسبه وزن ناودانی: [(ضخامت جان × ارتفاع جان) + 2×(ضخامت بال × عرض بال)] × طول × چگالی ÷ 1000
      const crossSectionArea = wt * wh + 2 * ft * fw;
      const weight = (crossSectionArea * l * d) / 1000;
      setResult(Math.round(weight * 100) / 100);
    }
  };

  const resetForm = () => {
    setFlangeWidth('');
    setFlangeThickness('');
    setWebHeight('');
    setWebThickness('');
    setLength('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن ناودانی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="flangeWidth">عرض بال (میلیمتر)</Label>
            <Input
              id="flangeWidth"
              type="number"
              value={flangeWidth}
              onChange={(e) => setFlangeWidth(e.target.value)}
              placeholder="مثال: 50"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="flangeThickness">ضخامت بال (میلیمتر)</Label>
            <Input
              id="flangeThickness"
              type="number"
              value={flangeThickness}
              onChange={(e) => setFlangeThickness(e.target.value)}
              placeholder="مثال: 4"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="webHeight">طول جان (میلیمتر)</Label>
            <Input
              id="webHeight"
              type="number"
              value={webHeight}
              onChange={(e) => setWebHeight(e.target.value)}
              placeholder="مثال: 100"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="webThickness">ضخامت جان (میلیمتر)</Label>
            <Input
              id="webThickness"
              type="number"
              value={webThickness}
              onChange={(e) => setWebThickness(e.target.value)}
              placeholder="مثال: 3"
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
            محاسبه وزن دقیق ناودانی
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
              <div className="text-sm text-green-700">وزن دقیق ناودانی</div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                عرض بال: {flangeWidth}mm × ضخامت بال: {flangeThickness}mm × طول:{' '}
                {length}m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                طول جان: {webHeight}mm × ضخامت جان: {webThickness}mm
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن ناودانی:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            وزن = [(ضخامت جان × ارتفاع جان) + 2×(ضخامت بال × عرض بال)] × طول ×
            چگالی ÷ 1000
          </code>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            <p>• انواع ناودانی: UPN و UPE</p>
            <p>• کاربرد در سازه‌های فولادی و چهارچوب‌ها</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
