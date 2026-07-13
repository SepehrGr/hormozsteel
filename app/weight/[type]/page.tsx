import { notFound } from 'next/navigation';
import Link from 'next/link';
import SheetWeightCalculator from '@/components/calculators/SheetWeightCalculator';
import BeamWeightCalculator from '@/components/calculators/BeamWeightCalculator';
import RebarWeightCalculator from '@/components/calculators/RebarWeightCalculator';
import BilletWeightCalculator from '@/components/calculators/BilletWeightCalculator';
import PipeWeightCalculator from '@/components/calculators/PipeWeightCalculator';
import StudWeightCalculator from '@/components/calculators/StudWeightCalculator';
import AngleWeightCalculator from '@/components/calculators/AngleWeightCalculator';
import SquareTubeWeightCalculator from '@/components/calculators/SquareTubeWeightCalculator';
import {
  Calculator,
  Star,
  Shield,
  Ruler,
  Layers,
  Truck,
  Users2,
} from 'lucide-react';

type WeightPageProps = {
  params: Promise<{
    type: string;
  }>;
};

// تعریف انواع ماشین حساب موجود
const WEIGHT_CALCULATORS = {
  sheet: {
    title: 'وزن ورق',
    description: 'محاسبه وزن انواع ورق فولادی',
  },
  beam: {
    title: 'وزن تیرآهن',
    description: 'محاسبه وزن انواع تیرآهن',
  },
  rebar: {
    title: 'وزن میلگرد',
    description: 'محاسبه وزن میلگرد آجدار و ساده',
  },
  billet: {
    title: 'وزن شمش فولادی',
    description: 'محاسبه وزن شمش فولادی',
  },
  pipe: {
    title: 'وزن لوله فولادی',
    description: 'محاسبه وزن انواع لوله فولادی',
  },
  stud: {
    title: 'وزن ناودانی',
    description: 'محاسبه وزن ناودانی',
  },
  angle: {
    title: 'وزن نبشی',
    description: 'محاسبه وزن نبشی',
  },
  'square-tube': {
    title: 'وزن قوطی',
    description: 'محاسبه وزن قوطی',
  },
};

export default async function WeightCalculatorPage({
  params,
}: WeightPageProps) {
  const resolvedParams = await params;
  const calculatorInfo =
    WEIGHT_CALCULATORS[resolvedParams.type as keyof typeof WEIGHT_CALCULATORS];
  if (!calculatorInfo) notFound();

  // Hero icon selection based on type
  // const heroIcon = getHeroIcon(params.type);

  return (
    <main className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 translate-x-20 -translate-y-20 rounded-full w-96 h-96 bg-white/5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 -translate-x-20 translate-y-20 rounded-full bg-white/5"></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 border-2 rounded-full shadow-2xl bg-white/20 backdrop-blur-md border-white/30">
              <span
                className="text-4xl text-white icon-calc drop-shadow-lg"
                style={{ fontFamily: 'icomoon' }}
                aria-label="آیکون ماشین حساب وزن"
              ></span>
            </div>
            <h1 className="mb-6 text-5xl font-bold text-white drop-shadow-2xl">
              {calculatorInfo.title}
            </h1>
            <p className="max-w-2xl mx-auto text-xl font-medium leading-relaxed text-white/95 drop-shadow-lg">
              {calculatorInfo.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 mt-8 text-sm sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20">
                <Shield className="w-4 h-4 text-white drop-shadow-md" />
                <span className="font-medium text-white drop-shadow-sm">
                  دقت بالا و تضمین صحت فرمول
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20">
                <Users2 className="w-4 h-4 text-white drop-shadow-md" />
                <span className="font-medium text-white drop-shadow-sm">
                  مناسب مهندسین و خریداران
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white/10 backdrop-blur-sm border-white/20">
                <Ruler className="w-4 h-4 text-white drop-shadow-md" />
                <span className="font-medium text-white drop-shadow-sm">
                  پشتیبانی از ابعاد و چگالی مختلف
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-6 py-16 mx-auto">
        {/* force LTR layout for the grid so column starts place items visually left/right */}
        <div
          dir="ltr"
          className="relative z-20 grid grid-cols-1 gap-12 -mt-24 lg:grid-cols-3"
        >
          {/* Calculator (main) */}
          <div className="flex flex-col gap-8 lg:col-span-2 lg:col-start-1 lg:order-1">
            {/* کارت ماشین حساب */}
            <div className="relative p-6 overflow-hidden border shadow-2xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 rounded-3xl md:p-8 backdrop-blur-md">
              {/* هدر کارت */}
              <div className="relative mb-6 text-center">
                <div className="inline-flex items-center gap-3 px-4 py-2 mb-4 border rounded-full bg-white/60 dark:bg-slate-800/60 border-gray-200/50 dark:border-gray-700/50">
                  <span
                    className="text-blue-600 icon-calc dark:text-blue-400"
                    style={{ fontFamily: 'icomoon' }}
                  ></span>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    ماشین حساب {calculatorInfo.title}
                  </span>
                </div>
              </div>

              {/* محتوای ماشین حساب */}
              <div className="relative">
                {renderCalculator(resolvedParams.type)}
              </div>
            </div>
            {/* اطلاعات و فرمول‌ها حذف شد */}
          </div>

          {/* Right Sidebar: other calculators */}
          <aside className="lg:col-span-1 lg:col-start-3 lg:order-2">
            <div className="sticky p-6 border shadow-2xl top-24 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-md">
              <div className="flex justify-center w-full mb-4">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-full shadow-sm w-max bg-white/20 dark:bg-white/6 border-white/10 dark:border-white/6 backdrop-blur-md">
                  <span
                    className="text-blue-600 icon-calc dark:text-blue-400"
                    style={{ fontFamily: 'icomoon' }}
                  ></span>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    ماشین حساب‌های دیگر
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {Object.entries(WEIGHT_CALCULATORS).map(([key, info]) => (
                  <li key={key}>
                    <Link
                      href={`/weight/${key}`}
                      scroll={false}
                      className={`flex items-start gap-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${resolvedParams.type === key ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800' : ''}`}
                    >
                      <div className="flex-1 text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(info as any).title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(info as any).description}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function getHeroIcon(type: string) {
  switch (type) {
    case 'sheet':
      return <Layers className="w-8 h-8 text-white" />;
    case 'beam':
      return <Truck className="w-8 h-8 text-white" />;
    case 'rebar':
      return <Ruler className="w-8 h-8 text-white" />;
    case 'billet':
      return <Star className="w-8 h-8 text-white" />;
    case 'pipe':
      return <Users2 className="w-8 h-8 text-white" />;
    case 'stud':
      return <Shield className="w-8 h-8 text-white" />;
    case 'angle':
      return <Calculator className="w-8 h-8 text-white" />;
    case 'square-tube':
      return <Layers className="w-8 h-8 text-white" />;
    default:
      return <Calculator className="w-8 h-8 text-white" />;
  }
}

function renderCalculator(type: string) {
  switch (type) {
    case 'sheet':
      return <SheetWeightCalculator />;
    case 'beam':
      return <BeamWeightCalculator />;
    case 'rebar':
      return <RebarWeightCalculator />;
    case 'billet':
      return <BilletWeightCalculator />;
    case 'pipe':
      return <PipeWeightCalculator />;
    case 'stud':
      return <StudWeightCalculator />;
    case 'angle':
      return <AngleWeightCalculator />;
    case 'square-tube':
      return <SquareTubeWeightCalculator />;
    default:
      return <div>ماشین حساب در دست توسعه است</div>;
  }
}

// Generate static params for all calculator types
export async function generateStaticParams() {
  return Object.keys(WEIGHT_CALCULATORS).map((type) => ({
    type,
  }));
}
