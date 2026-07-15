import React from 'react';
import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/types/products';

type Props = {
  current?: string;
};

export default function ProductsSidebar({ current }: Props) {
  return (
    <div className="sticky top-24">
      <div className="p-4 border shadow-lg sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-md">
        <div className="flex justify-center w-full mb-4">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 border rounded-full shadow-sm w-max bg-white/40 dark:bg-white/10 border-white/20 dark:border-white/10 backdrop-blur-md">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              دسته‌بندی‌ها
            </span>
          </div>
        </div>

        <ul className="space-y-1.5">
          {PRODUCT_CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products/${cat.id}`}
                scroll={false}
                className={`flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm ${
                  current === cat.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 font-medium'
                    : ''
                }`}
              >
                <div className="flex-1 text-right">
                  <div className="text-gray-900 dark:text-white">
                    {cat.name}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
