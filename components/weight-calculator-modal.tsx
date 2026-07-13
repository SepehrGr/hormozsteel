'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import RebarWeightCalculator from '@/components/calculators/RebarWeightCalculator';
import SheetWeightCalculator from '@/components/calculators/SheetWeightCalculator';
import BeamWeightCalculator from '@/components/calculators/BeamWeightCalculator';
import PipeWeightCalculator from '@/components/calculators/PipeWeightCalculator';
import AngleWeightCalculator from '@/components/calculators/AngleWeightCalculator';
import StudWeightCalculator from '@/components/calculators/StudWeightCalculator';
import BilletWeightCalculator from '@/components/calculators/BilletWeightCalculator';
import SquareTubeWeightCalculator from '@/components/calculators/SquareTubeWeightCalculator';

interface WeightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productCategory?: string;
  productPrice?: number; // قیمت محصول به ازای واحد (کیلوگرم یا تن)
  productUnit?: 'kg' | 'ton' | 'piece'; // واحد محصول
  includeVAT?: boolean; // شامل ارزش افزوده
  formatPrice?: (price: number) => string;
}

export default function WeightCalculatorModal({
  isOpen,
  onClose,
  productName,
  productCategory,
  productPrice,
  productUnit = 'kg',
  includeVAT = false,
  formatPrice: customFormatPrice,
}: WeightCalculatorModalProps) {
  // تشخیص نوع ماشین حساب بر اساس دسته‌بندی محصول
  const getCalculatorType = () => {
    if (!productCategory && !productName) return 'rebar'; // پیش‌فرض میلگرد

    const searchText =
      `${productCategory || ''} ${productName || ''}`.toLowerCase();

    if (searchText.includes('میلگرد') || searchText.includes('rebar')) {
      return 'rebar';
    } else if (searchText.includes('ورق') || searchText.includes('sheet')) {
      return 'sheet';
    } else if (
      searchText.includes('تیرآهن') ||
      searchText.includes('تیر') ||
      searchText.includes('beam')
    ) {
      return 'beam';
    } else if (searchText.includes('لوله') || searchText.includes('pipe')) {
      return 'pipe';
    } else if (searchText.includes('نبشی') || searchText.includes('angle')) {
      return 'angle';
    } else if (
      searchText.includes('ناودانی') ||
      searchText.includes('استاد') ||
      searchText.includes('stud')
    ) {
      return 'stud';
    } else if (searchText.includes('شمش') || searchText.includes('billet')) {
      return 'billet';
    } else if (
      searchText.includes('قوطی') ||
      searchText.includes('square') ||
      searchText.includes('tube')
    ) {
      return 'square-tube';
    } else {
      return 'rebar'; // پیش‌فرض
    }
  };

  const calculatorType = getCalculatorType();

  const getCalculatorTitle = () => {
    switch (calculatorType) {
      case 'sheet':
        return 'ماشین حساب وزن ورق';
      case 'beam':
        return 'ماشین حساب وزن تیرآهن';
      case 'pipe':
        return 'ماشین حساب وزن لوله';
      case 'angle':
        return 'ماشین حساب وزن نبشی';
      case 'stud':
        return 'ماشین حساب وزن ناودانی';
      case 'billet':
        return 'ماشین حساب وزن شمش';
      case 'square-tube':
        return 'ماشین حساب وزن قوطی';
      case 'rebar':
      default:
        return 'ماشین حساب وزن میلگرد';
    }
  };

  const renderCalculator = () => {
    const calculatorProps = {
      productPrice,
      productUnit,
      includeVAT,
      formatPrice:
        customFormatPrice || ((price: number) => price.toLocaleString('fa-IR')),
    };

    switch (calculatorType) {
      case 'sheet':
        return <SheetWeightCalculator {...calculatorProps} />;
      case 'beam':
        return <BeamWeightCalculator />;
      case 'pipe':
        return <PipeWeightCalculator />;
      case 'angle':
        return <AngleWeightCalculator />;
      case 'stud':
        return <StudWeightCalculator />;
      case 'billet':
        return <BilletWeightCalculator />;
      case 'square-tube':
        return <SquareTubeWeightCalculator />;
      case 'rebar':
      default:
        return <RebarWeightCalculator {...calculatorProps} />;
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // جلوگیری از اسکرول پس‌زمینه
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
            <div>
              <CardTitle className="text-lg">{getCalculatorTitle()}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                محاسبه دقیق وزن {productPrice ? 'و قیمت ' : ''}
                {productName || 'محصول انتخابی'}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent>
            {productName && (
              <div className="p-3 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  محصول انتخابی:{' '}
                  <span className="font-semibold">{productName}</span>
                </div>
              </div>
            )}

            {renderCalculator()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
