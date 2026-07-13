'use client';

import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">
        در حال بارگذاری نقشه...
      </div>
    </div>
  ),
});

export default function Map() {
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
      <MapWithNoSSR />
    </div>
  );
}
