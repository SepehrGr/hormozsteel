'use client'

import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className='flex h-[280px] w-full items-center justify-center bg-muted text-sm text-muted-foreground sm:h-[320px]'>
      Loading map…
    </div>
  ),
})

export default function Map() {
  return (
    <div className='h-[280px] w-full overflow-hidden sm:h-[320px]'>
      <MapWithNoSSR />
    </div>
  )
}
