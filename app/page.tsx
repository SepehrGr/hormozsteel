import Hero from '@/components/home/hero'
import ProductTiles from '@/components/home/product-tiles'
import LatestPrices from '@/components/home/latest-prices'
import WeighSection from '@/components/home/weigh-section'
import AboutSection from '@/components/home/about-section'
import CtaStrip from '@/components/content/cta-strip'
import { getLatestPrices, getRebarRates } from '@/lib/data/prices'
import { getCategoryFloors, getPriceIndex } from '@/lib/data/catalog'

/** The price rail is at most a minute behind the latest move. */
export const revalidate = 60

export default async function Home() {
  const [latestPrices, priceIndex, floors, rebarRates] = await Promise.all([
    getLatestPrices(),
    getPriceIndex(),
    getCategoryFloors(),
    getRebarRates(),
  ])

  return (
    <main className='flex flex-col bg-background'>
      <Hero index={priceIndex} moves={latestPrices} />
      <ProductTiles floors={floors} />
      <LatestPrices products={latestPrices} />
      <WeighSection rates={rebarRates} />
      <AboutSection />
      <CtaStrip
        body='Send grade, size and tonnage. Sales replies with a proforma: price, delivery and settlement agreed before anything is loaded.'
        primary={{ href: '/contact', label: 'Request a quote' }}
        secondary={{ href: '/products', label: 'Browse the catalog' }}
        title='Ready for a firm price?'
      />
    </main>
  )
}
