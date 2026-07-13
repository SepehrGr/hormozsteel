'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

export default function SquareTubeWeightCalculator() {
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [thickness, setThickness] = useState('');
  const [branchLength, setBranchLength] = useState('');
  const [density, setDensity] = useState('8');
  const [result, setResult] = useState<number | null>(null);

  const calculateWeight = () => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    const t = parseFloat(thickness);
    const bl = parseFloat(branchLength);
    const d = parseFloat(density);

    if (w && l && t && bl && d) {
      // فرمول محاسبه وزن قوطی مطابق سایت آهن ملل:
      // 2 × (طول قوطی + عرض قوطی) × چگالی آهن × ضخامت × طول شاخه ÷ 1000
      const weight = (2 * (w + l) * d * t * bl) / 1000;

      setResult(Math.round(weight * 100) / 100);
    }
  };

  const resetForm = () => {
    setWidth('');
    setLength('');
    setThickness('');
    setBranchLength('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن قوطی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="width">
              عرض مقطع <span className="text-xs">(میلی‌متر)</span>
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="مثال: 12"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="length">
              طول مقطع <span className="text-xs">(میلی‌متر)</span>
            </Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="مثال: 55"
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
              placeholder="مثال: 3.5"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="branchLength">
              طول شاخه <span className="text-xs">(متر)</span>
            </Label>
            <Input
              id="branchLength"
              type="number"
              value={branchLength}
              onChange={(e) => setBranchLength(e.target.value)}
              placeholder="مثال: 7"
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
            محاسبه وزن دقیق قوطی
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
              <div className="text-sm text-green-700">محاسبه وزن دقیق قوطی</div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                ابعاد: {width}×{length}×{thickness}{' '}
                <span className="text-xs">(میلی‌متر)</span> × طول شاخه:{' '}
                {branchLength} <span className="text-xs">(متر)</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                چگالی استفاده شده: {density}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن قوطی:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            2 × (طول قوطی + عرض قوطی) × چگالی آهن × ضخامت × طول شاخه ÷ 1000 =
            وزن قوطی
          </code>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            <p>• قوطی مربعی (SHS): مقطع مربعی با ابعاد یکسان</p>
            <p>• قوطی مستطیلی (RHS): مقطع مستطیلی با ابعاد مختلف</p>
            <p>• استفاده در سازه‌های فولادی، تزئینات و صنایع ساختمانی</p>
            <p>• چگالی رایج: 8 - چگالی استاندارد: 7.85</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
