'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@heroui/select';

export default function BeamWeightCalculator() {
  const [beamType, setBeamType] = useState('IPE');
  const [length, setLength] = useState('');
  const [density, setDensity] = useState('8');

  // ابعاد تیرآهن
  const [height, setHeight] = useState('');
  const [flangeWidth, setFlangeWidth] = useState('');
  const [webThickness, setWebThickness] = useState('');
  const [flangeThickness, setFlangeThickness] = useState('');

  const [result, setResult] = useState<number | null>(null);

  const calculateWeight = () => {
    const l = parseFloat(length);
    const h = parseFloat(height);
    const fw = parseFloat(flangeWidth);
    const wt = parseFloat(webThickness);
    const ft = parseFloat(flangeThickness);
    const d = parseFloat(density);

    if (l && h && fw && wt && ft && d) {
      // فرمول محاسبه وزن تیرآهن:
      // وزن = [(ارتفاع جان × ضخامت جان) + 2 × (عرض بال × ضخامت بال)] × طول × چگالی / 1000
      const crossSectionArea = h * wt + 2 * fw * ft;
      const weight = (crossSectionArea * l * d) / 1000;
      setResult(Math.round(weight * 100) / 100);
    }
  };

  const resetForm = () => {
    setLength('');
    setHeight('');
    setFlangeWidth('');
    setWebThickness('');
    setFlangeThickness('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 mb-7 dark:text-white">
          محاسبه وزن تیرآهن
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="beamType">نوع تیرآهن</Label>
            <Select
              selectedKeys={[beamType]}
              onSelectionChange={(keys) =>
                setBeamType(Array.from(keys)[0] as string)
              }
              placeholder="انتخاب نوع تیرآهن"
              variant="bordered"
              className="mt-1 bg-white dark:bg-neutral-900"
            >
              <SelectItem key="IPE">IPE (استاندارد اروپا)</SelectItem>
              <SelectItem key="INP">INP (استاندارد چین/روسیه)</SelectItem>
              <SelectItem key="IPB">IPB (بال پهن)</SelectItem>
              <SelectItem key="CPB">CPB (لانه زنبوری)</SelectItem>
            </Select>
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
              <SelectItem key="7.84">استیل (7.84)</SelectItem>
              <SelectItem key="2.7">آلومینیوم (2.7)</SelectItem>
              <SelectItem key="8.96">مس (8.96)</SelectItem>
              <SelectItem key="8.5">برنج (8.5)</SelectItem>
            </Select>
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

          <div>
            <Label htmlFor="height">ارتفاع جان (میلیمتر)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="مثال: 200"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="flangeWidth">عرض بال (میلیمتر)</Label>
            <Input
              id="flangeWidth"
              type="number"
              value={flangeWidth}
              onChange={(e) => setFlangeWidth(e.target.value)}
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
              placeholder="مثال: 5.6"
              variant="bordered"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="flangeThickness">ضخامت بال (میلیمتر)</Label>
            <Input
              id="flangeThickness"
              type="number"
              value={flangeThickness}
              onChange={(e) => setFlangeThickness(e.target.value)}
              placeholder="مثال: 8.5"
              variant="bordered"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={calculateWeight}
            variant="outline"
            className="flex-1"
          >
            محاسبه وزن دقیق تیرآهن
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
                وزن دقیق تیرآهن {beamType}
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-200">
                طول: {length}m × ارتفاع: {height}mm × عرض بال: {flangeWidth}mm
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200">
                ضخامت جان: {webThickness}mm × ضخامت بال: {flangeThickness}mm
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/40 dark:border-blue-700">
          <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
            فرمول محاسبه وزن تیرآهن:
          </h4>
          <code className="block mb-2 text-sm text-blue-700 dark:text-blue-200">
            وزن = [(ارتفاع جان × ضخامت جان) + 2 × (عرض بال × ضخامت بال)] × طول ×
            چگالی ÷ 1000
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
