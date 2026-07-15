import TraitItem from './trait-item'
import { traitItems } from '@/config/trait-items'

export default function Traits() {
  return (
    <section className='relative w-full overflow-hidden py-10'>
      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-10 text-center'>
          <h2 className='mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl'>
            Built for confident purchasing
          </h2>
          <p className='mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
            Straightforward catalog for industrial buyers — prices, categories,
            and admin tools without the noise.
          </p>
        </div>

        <div className='mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {traitItems.map((item, index) => (
            <div
              key={item.id}
              className='animate-fade-in-up flex opacity-0'
              style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <TraitItem
                title={item.title}
                icon={item.icon}
                description={item.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
