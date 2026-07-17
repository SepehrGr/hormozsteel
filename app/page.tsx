import Hero from '@/components/home/hero'
import Traits from '@/components/home/traits'
import ProductSlider from '@/components/home/product-slider'
import AboutSection from '@/components/home/about-section'

export default function Home() {
  return (
    <main className='flex flex-col bg-background'>
      <Hero />
      <ProductSlider title='Latest prices' fetchFromApi={true} />
      <AboutSection />
      <Traits />
    </main>
  )
}
