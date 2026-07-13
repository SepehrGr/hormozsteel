'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface DataSourceToggleProps {
  slug: string;
}

export default function DataSourceToggle({ slug }: DataSourceToggleProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const source = searchParams.get('source');

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex gap-2">
        <Link
          href={`/products/${slug}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            source !== 'sheets'
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          📊 داده‌های استاتیک
        </Link>
        <Link
          href={`/products/${slug}?source=sheets`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            source === 'sheets'
              ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          🔄 Google Sheets
        </Link>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {source === 'sheets' ? (
          <span className="flex items-center">
            <div className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></div>
            داده‌ها از Google Sheets دریافت می‌شوند
          </span>
        ) : (
          'داده‌های نمونه استاتیک'
        )}
      </div>
    </div>
  );
}
