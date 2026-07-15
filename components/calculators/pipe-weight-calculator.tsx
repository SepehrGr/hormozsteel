'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

export default function PipeWeightCalculator() {
  const [outerDiameter, setOuterDiameter] = useState('');
  const [thickness, setThickness] = useState('');
  const [length, setLength] = useState('');
  const [density, setDensity] = useState('8');
  const [result, setResult] = useState<number | null>(null);

  const calculateWeight = () => {
    const od = parseFloat(outerDiameter);
    const t = parseFloat(thickness);
    const l = parseFloat(length);
    const d = parseFloat(density);

    if (od && t && l && d) {
      // فرمول محاسبه وزن لوله: π × قطر میانی × ضخامت × طول × چگالی / 1000
      // قطر میانی = قطر بیرونی - ضخامت
      const meanDiameter = od - t;
      const weight = (Math.PI * meanDiameter * t * l * d) / 1000;
      setResult(Math.round(weight * 100) / 100);
    }
  };

  const resetForm = () => {
    setOuterDiameter('');
    setThickness('');
    setLength('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن لوله فولادی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="outerDiameter">قطر بیرونی (میلیمتر)</Label>
            <Input
              id="outerDiameter"
              type="number"
              value={outerDiameter}
              onChange={(e) => setOuterDiameter(e.target.value)}
              placeholder="مثال: 60.3"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="thickness">ضخامت لوله (میلیمتر)</Label>
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

          <div>
            <Label htmlFor="length">طول لوله (متر)</Label>
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
              <SelectItem key="8.96">مس (8.96)</SelectItem>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={calculateWeight}
            variant="outline"
            className="flex-1"
          >
            محاسبه وزن دقیق لوله
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
              <div className="text-sm text-green-700">وزن دقیق لوله فولادی</div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                قطر بیرونی: {outerDiameter}mm × ضخامت: {thickness}mm × طول:{' '}
                {length}m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                قطر داخلی:{' '}
                {outerDiameter && thickness
                  ? (
                      parseFloat(outerDiameter) -
                      2 * parseFloat(thickness)
                    ).toFixed(1)
                  : '---'}
                mm
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن لوله:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            وزن = π × (قطر بیرونی - ضخامت) × ضخامت × طول × چگالی ÷ 1000
          </code>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-200">
            <p>
              • انواع لوله: درزدار، بدون درز، گالوانیزه، استیل، مس، آلومینیوم
            </p>
            <p>• روش تولید بر کیفیت و وزن تأثیر می‌گذارد</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
