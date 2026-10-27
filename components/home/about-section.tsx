import Image from 'next/image'
import Link from 'next/link'

import { ABOUT_FACTS, ABOUT_HERO } from '@/config/about'

export default function AboutSection() {
  return (
    <section className='border-b border-border bg-background'>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16'>
        <div className='relative aspect-[16/10] overflow-hidden border border-border bg-muted'>
          <Image
            fill
            alt={ABOUT_HERO.alt}
            blurDataURL={ABOUT_HERO.blur}
            className='object-cover'
            placeholder='blur'
            sizes='(max-width: 1024px) 100vw, 640px'
            src={ABOUT_HERO.src}
          />
        </div>

        <div>
          <h2 className='max-w-[18ch] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
            We bought steel for our own sites before we sold it
          </h2>
          <p className='mt-4 max-w-[52ch] leading-relaxed text-muted-foreground'>
            Building first, trading second. That order is why we quote the way
            we wanted to be quoted: spec first, then price, then logistics.
          </p>
          <dl className='mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4'>
            {ABOUT_FACTS.map(fact => (
              <div key={fact.label}>
                <dt className='text-sm text-muted-foreground'>{fact.label}</dt>
                <dd className='mt-1 text-xl font-semibold tracking-tight text-foreground'>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm'>
            <Link
              className='font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-500'
              href='/about'
            >
              Company overview
            </Link>
            <span className='text-muted-foreground'>
              Demo company: the facts are illustrative.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
