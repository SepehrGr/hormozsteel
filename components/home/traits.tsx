import TraitItem from './trait-item'
import { traitItems } from '@/config/trait-items'

export default function Traits() {
  return (
    <section className='w-full bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-15'>
        <div className='mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between'>
          <div className='max-w-xl'>
            <p className='mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
              How we work with buyers
            </p>
            <h2 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
              Clear terms from first look to load-out
            </h2>
            <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
              Pricing transparency, settlement options, and quality checks — so
              estimates and shipments stay aligned with the job.
            </p>
          </div>
        </div>

        <div className='overflow-hidden border border-border bg-border shadow-sm dark:shadow-none'>
          <div className='grid grid-cols-1 gap-px sm:grid-cols-2 xl:grid-cols-4'>
            {traitItems.map((item, index) => (
              <TraitItem
                key={item.id}
                index={index}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
