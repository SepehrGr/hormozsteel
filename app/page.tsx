import Hero from '@/components/home/hero'
import Traits from '@/components/home/traits'
import ProductSlider from '@/components/home/product-slider'
import AboutSection from '@/components/home/about-section'
import { getLatestPrices } from '@/lib/data/prices'

/** The price rail is at most a minute behind the latest move. */
export const revalidate = 60

export default async function Home() {
  const latestPrices = await getLatestPrices()

  return (
    <main className='flex flex-col bg-background'>
      <Hero />
      <ProductSlider products={latestPrices} />
      <AboutSection />
      <Traits />
    </main>
  )
}
