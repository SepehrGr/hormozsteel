import Hero from '@/components/home/hero'
import Traits from '@/components/home/traits'
import ProductSlider from '@/components/home/product-slider'
import AboutSection from '@/components/home/about-section'

export default function Home() {
  return (
    <main className='flex flex-col gap-12 bg-background'>
      <section>
        <Hero />
      </section>

      <section className='container mx-auto px-4'>
        <ProductSlider title='Latest prices' fetchFromApi={true} />
      </section>

      <section>
        <AboutSection />
      </section>

      <section>
        <Traits />
      </section>
    </main>
  )
}
